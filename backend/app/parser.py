"""Analisador descendente recursivo para a gramática da Etapa 4.

Opera somente sobre tokens já validados pelo scanner. O código-fonte é usado
para localizar o fim da entrada, sem executar nem reinterpretar o programa.
"""
from dataclasses import dataclass
from itertools import count
from typing import NoReturn, TypedDict

LIMITE_ANINHAMENTO = 64
LIMITE_PROFUNDIDADE_AST = 128
COMPARADORES = {"==", "!=", "<", "<=", ">", ">="}
SINAIS = {"+", "-"}
MULTIPLICATIVOS = {"*", "/"}
NUMEROS = {"LITERAL_INTEIRO": "inteiro", "LITERAL_REAL": "real"}
TERMINAIS_POR_CATEGORIA = {"EOF", "NEWLINE", "INDENT", "DEDENT", "IDENTIFICADOR"}

Posicao = tuple[int, int]


class Token(TypedDict):
    tipo: str
    lexema: str
    linha: int
    coluna: int


@dataclass(frozen=True)
class _No:
    tipo: str
    inicio: Posicao
    fim: Posicao
    campos: dict
    profundidade: int

    def para_json(self, identificadores):
        no = {
            "id": f"n{next(identificadores)}",
            "tipo": self.tipo,
            "linha": self.inicio[0],
            "coluna": self.inicio[1],
            "linha_fim": self.fim[0],
            "coluna_fim": self.fim[1],
        }
        for campo, valor in self.campos.items():
            if isinstance(valor, _No):
                no[campo] = valor.para_json(identificadores)
            elif isinstance(valor, list):
                no[campo] = [filho.para_json(identificadores) for filho in valor]
            else:
                no[campo] = valor
        return no


class _ErroSintatico(Exception):
    def __init__(self, diagnostico):
        super().__init__(diagnostico["mensagem"])
        self.diagnostico = diagnostico


def _inicio(token: Token) -> Posicao:
    return token["linha"], token["coluna"]


def _fim(token: Token) -> Posicao:
    return token["linha"], token["coluna"] + len(token["lexema"])


def _eof(codigo: str) -> Token:
    linhas = codigo.splitlines(keepends=True)
    if not linhas or codigo.endswith(("\n", "\r")):
        linha, coluna = len(linhas) + 1, 1
    else:
        linha, coluna = len(linhas), len(linhas[-1]) + 1
    return {"tipo": "EOF", "lexema": "", "linha": linha, "coluna": coluna}


class _Parser:
    def __init__(self, tokens: list[Token], codigo: str):
        self.eof = _eof(codigo)
        self.tokens = [*tokens, self.eof]
        self.indice = 0
        self.blocos = 0
        self.parenteses = 0

    @property
    def atual(self) -> Token:
        return self.tokens[self.indice]

    @property
    def anterior(self) -> Token:
        return self.tokens[self.indice - 1]

    def _avancar(self) -> Token:
        token = self.atual
        self.indice += 1
        return token

    def _corresponde(self, terminal: str) -> bool:
        campo = "tipo" if terminal in TERMINAIS_POR_CATEGORIA else "lexema"
        return self.atual[campo] == terminal

    def _exigir(self, terminal: str, regra: str, instrucao: str) -> Token:
        if self._corresponde(terminal):
            return self._avancar()
        self._falhar(terminal, regra, instrucao)

    def _falhar(self, esperado: str, regra: str, instrucao: str, *,
                token: Token | None = None, tipo: str = "ERRO_SINTATICO",
                limite: int | None = None) -> NoReturn:
        token = self.atual if token is None else token
        # DEDENT sintético no fim não contém um símbolo a corrigir no texto.
        if token["tipo"] == "DEDENT" and _inicio(token) == _inicio(self.eof):
            token = self.eof
        linha, coluna = _inicio(token)
        if token["tipo"] in {"EOF", "NEWLINE", "INDENT", "DEDENT"}:
            encontrado = token["tipo"]
            descricao = {
                "EOF": "o fim do código (EOF)",
                "NEWLINE": "o fim da linha (NEWLINE)",
                "INDENT": "um aumento de recuo (INDENT)",
                "DEDENT": "o fim do bloco (DEDENT)",
            }[encontrado]
        else:
            encontrado = token["lexema"]
            descricao = repr(encontrado)
        rotulo = "Erro sintático" if limite is None else "Limite da análise sintática"
        erro = {
            "tipo": tipo, "linha": linha, "coluna": coluna, "regra": regra,
            "esperado": esperado, "encontrado": encontrado,
            "mensagem": f"{rotulo} na linha {linha}, coluna {coluna}: {instrucao} Encontrado: {descricao}.",
        }
        if limite is not None:
            erro.update(natureza="limite_do_subconjunto", limite=limite)
        raise _ErroSintatico(erro)

    def _limitar_aninhamento(self, niveis: int, construcao: str, regra: str):
        if niveis >= LIMITE_ANINHAMENTO:
            self._falhar(
                f"até {LIMITE_ANINHAMENTO} níveis de {construcao}", regra,
                f"O visualizador aceita até {LIMITE_ANINHAMENTO} níveis de {construcao}. "
                "Divida a construção em partes menores para analisá-la.",
                tipo="limite_aninhamento_excedido", limite=LIMITE_ANINHAMENTO,
            )

    def _no(self, tipo: str, inicio: Token, fim: Posicao, **campos) -> _No:
        profundidade_filhos = 0
        for valor in campos.values():
            if isinstance(valor, _No):
                profundidade_filhos = max(profundidade_filhos, valor.profundidade)
            elif isinstance(valor, list):
                profundidade_filhos = max(profundidade_filhos, max((no.profundidade for no in valor), default=0))
        profundidade = profundidade_filhos + 1
        if profundidade > LIMITE_PROFUNDIDADE_AST:
            self._falhar(
                f"árvore com até {LIMITE_PROFUNDIDADE_AST} níveis", "programa",
                f"A árvore excedeu {LIMITE_PROFUNDIDADE_AST} níveis de profundidade. "
                "Divida a expressão ou o bloco em partes menores.",
                token=inicio, tipo="limite_profundidade_ast_excedido", limite=LIMITE_PROFUNDIDADE_AST,
            )
        return _No(tipo, _inicio(inicio), fim, campos, profundidade)

    def programa(self) -> _No:
        inicio = self.atual
        corpo = []
        while not self._corresponde("EOF"):
            corpo.append(self._comando())
        fim = corpo[-1].fim if corpo else _inicio(self.eof)
        return self._no("Programa", inicio, fim, corpo=corpo)

    def _comando(self) -> _No:
        if self._corresponde("if"):
            return self._condicional()
        if not self._corresponde("IDENTIFICADOR"):
            instrucao = "Use uma atribuição com identificador e '=' ou inicie uma condição com 'if'."
            if self._corresponde("else"):
                instrucao = "O 'else' precisa vir depois do bloco de um 'if' no mesmo nível de recuo."
            elif self._corresponde("INDENT"):
                instrucao = "O recuo só pode aumentar ao iniciar o bloco de um 'if' ou 'else'."
            self._falhar("atribuicao_ou_if", "comando", instrucao)

        atribuicao = self._atribuicao()
        self._exigir("NEWLINE", "comando", "Termine a atribuição antes de iniciar outro comando na próxima linha.")
        return atribuicao

    def _atribuicao(self) -> _No:
        nome = self._avancar()
        alvo = self._nome(nome)
        self._exigir("=", "atribuicao", "Use '=' após o nome da variável e informe o valor a atribuir.")
        valor = self._expressao("NEWLINE")
        return self._no("Atribuicao", nome, _fim(self.anterior), alvo=alvo, valor=valor)

    def _condicional(self) -> _No:
        inicio = self._avancar()
        condicao = self._expressao(":")
        self._exigir(":", "condicional", "Use ':' ao final da condição do 'if' para introduzir o bloco.")
        entao = self._bloco("if")
        senao = []
        if self._corresponde("else"):
            self._avancar()
            self._exigir(":", "condicional", "Use ':' logo após 'else' para introduzir o bloco alternativo.")
            senao = self._bloco("else")
        return self._no("Se", inicio, (senao or entao)[-1].fim, condicao=condicao, entao=entao, senao=senao)

    def _bloco(self, cabecalho: str) -> list[_No]:
        self._exigir("NEWLINE", "condicional", f"Inicie o bloco de '{cabecalho}' na próxima linha, com recuo.")
        if self._corresponde("INDENT"):
            self._limitar_aninhamento(self.blocos, "blocos", "bloco")
        self._exigir("INDENT", "bloco", f"Inclua pelo menos um comando recuado no bloco de '{cabecalho}'.")
        self.blocos += 1
        comandos = [self._comando()]
        while not (self._corresponde("DEDENT") or self._corresponde("EOF")):
            comandos.append(self._comando())
        self._exigir("DEDENT", "bloco", "Volte ao recuo anterior para encerrar o bloco.")
        self.blocos -= 1
        return comandos

    def _expressao(self, terminal_final: str) -> _No:
        inicio = self.atual
        esquerda = self._soma()
        if self.atual["lexema"] in COMPARADORES:
            operador = self._avancar()["lexema"]
            direita = self._soma()
            if self.atual["lexema"] in COMPARADORES:
                self._falhar(terminal_final, "expressao", "Use apenas um comparador por expressão neste subconjunto.")
            return self._no("Comparacao", inicio, _fim(self.anterior),
                            operador=operador, esquerda=esquerda, direita=direita)
        return esquerda

    def _soma(self) -> _No:
        return self._cadeia_binaria(self._produto, SINAIS)

    def _produto(self) -> _No:
        return self._cadeia_binaria(self._unaria, MULTIPLICATIVOS)

    def _cadeia_binaria(self, ler_operando, operadores: set[str]) -> _No:
        inicio = self.atual
        esquerda = ler_operando()
        while self.atual["lexema"] in operadores:
            operador = self._avancar()["lexema"]
            direita = ler_operando()
            esquerda = self._no("Binaria", inicio, _fim(self.anterior),
                                operador=operador, esquerda=esquerda, direita=direita)
        return esquerda

    def _unaria(self) -> _No:
        sinais = []
        while self.atual["lexema"] in SINAIS:
            sinais.append(self._avancar())
        operando = self._primaria()
        fim = _fim(self.anterior)
        for sinal in reversed(sinais):
            operando = self._no("Unaria", sinal, fim, operador=sinal["lexema"], operando=operando)
        return operando

    def _nome(self, token: Token) -> _No:
        return self._no("Nome", token, _fim(token), identificador=token["lexema"])

    def _primaria(self) -> _No:
        token = self.atual
        if self._corresponde("IDENTIFICADOR"):
            return self._nome(self._avancar())
        if token["tipo"] in NUMEROS:
            self._avancar()
            return self._no("Numero", token, _fim(token), lexema=token["lexema"], categoria=NUMEROS[token["tipo"]])
        if self._corresponde("("):
            self._limitar_aninhamento(self.parenteses, "parênteses", "primaria")
            self._avancar()
            self.parenteses += 1
            expressao = self._expressao(")")
            linha, coluna = _inicio(token)
            self._exigir(")", "primaria", f"Feche com ')' o parêntese aberto na linha {linha}, coluna {coluna}.")
            self.parenteses -= 1
            return expressao
        self._falhar("expressao_primaria", "primaria", "Use um identificador, um número ou uma expressão entre parênteses.")


def analisar(tokens: list[Token], codigo: str) -> dict:
    """Retorna a AST completa ou apenas o primeiro diagnóstico sintático."""
    try:
        arvore = _Parser(tokens, codigo).programa()
    except _ErroSintatico as erro:
        return {"estado_sintatico": "invalido", "ast": None, "erros_sintaticos": [erro.diagnostico]}
    return {"estado_sintatico": "valido", "ast": arvore.para_json(count(1)), "erros_sintaticos": []}
