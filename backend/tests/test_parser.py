"""Casos práticos com os oráculos definidos antes da implementação."""
import pytest

from app import parser, scanner
from test_planejamento_etapa4 import CASOS


CASOS_SINTATICOS = [caso for caso in CASOS if caso["fase_alvo"] == "sintatica"]
METADADOS_NOS = {"id", "linha", "coluna", "linha_fim", "coluna_fim"}


def sem_metadados(valor):
    if isinstance(valor, list):
        return [sem_metadados(item) for item in valor]
    if isinstance(valor, dict):
        return {campo: sem_metadados(item) for campo, item in valor.items() if campo not in METADADOS_NOS}
    return valor


def analisar(codigo):
    lexico = scanner.analisar(codigo)
    assert lexico["sucesso"], lexico["erros"]
    return parser.analisar(lexico["tokens"], codigo)


@pytest.mark.parametrize("caso", CASOS_SINTATICOS, ids=lambda caso: caso["id"])
def test_caso_sintatico_do_plano_congelado(caso):
    esperado = caso["expectativa"]["sintatico"]
    observado = analisar(caso["entrada"])
    assert observado["estado_sintatico"] == ("valido" if esperado["sucesso"] else "invalido")
    assert sem_metadados(observado["ast"]) == esperado["ast"]
    if esperado["sucesso"]:
        assert observado["erros_sintaticos"] == []
    else:
        erro, = observado["erros_sintaticos"]
        for campo, valor in esperado["diagnostico"].items():
            assert erro[campo] == valor
        assert erro["mensagem"] and erro["regra"]


def test_associatividade_binaria_e_unaria():
    corpo = analisar("subtracao = 20 - 5 - 3\ndivisao = 8 / 4 / 2\nsinais = -+2")['ast']['corpo']
    subtracao, divisao, sinais = (no["valor"] for no in corpo)
    assert subtracao["operador"] == subtracao["esquerda"]["operador"] == "-"
    assert subtracao["esquerda"]["direita"]["lexema"] == "5"
    assert subtracao["direita"]["lexema"] == "3"
    assert divisao["operador"] == divisao["esquerda"]["operador"] == "/"
    assert divisao["direita"]["lexema"] == "2"
    assert sinais["operador"] == "-" and sinais["operando"]["operador"] == "+"
    assert sinais["operando"]["operando"]["lexema"] == "2"


def test_posicoes_exclusivas_e_ids_da_arvore_multilinha():
    codigo = "# cabeçalho\r\nx = (11 +\r\n    2) # comentário\r\n"
    ast = analisar(codigo)["ast"]
    atribuicao, = ast["corpo"]
    soma = atribuicao["valor"]
    nos = [ast, atribuicao, atribuicao["alvo"], soma, soma["esquerda"], soma["direita"]]
    assert [no["id"] for no in nos] == ["n1", "n2", "n3", "n4", "n5", "n6"]
    assert [tuple(no[k] for k in ("linha", "coluna", "linha_fim", "coluna_fim")) for no in nos] == [
        (2, 1, 3, 7), (2, 1, 3, 7), (2, 1, 2, 2), (2, 6, 3, 6), (2, 6, 2, 8), (3, 5, 3, 6),
    ]


def test_condicional_termina_no_ultimo_comando_do_else():
    ast = analisar("if x:\n    y = 10\nelse:\n    y = 0\nz = 10")['ast']
    condicional, atribuicao = ast["corpo"]
    assert (condicional["linha"], condicional["coluna"], condicional["linha_fim"], condicional["coluna_fim"]) == (1, 1, 4, 10)
    assert (atribuicao["linha"], atribuicao["coluna"]) == (5, 1)


def test_primeiro_erro_e_explicacao_de_parentese_ate_o_eof():
    resultado = analisar("if 1:\r\n    x = (2\r\n")
    erro, = resultado["erros_sintaticos"]
    assert (erro["tipo"], erro["linha"], erro["coluna"], erro["esperado"], erro["encontrado"]) == (
        "ERRO_SINTATICO", 3, 1, ")", "EOF",
    )
    assert erro["regra"] == "primaria"
    assert "aberto na linha 2, coluna 9" in erro["mensagem"]
    assert resultado["ast"] is None


@pytest.mark.parametrize("comparador", ["==", "!=", "<", "<=", ">", ">="])
def test_comparadores_respeitam_precedencia(comparador):
    valor = analisar(f"x = a + 1 {comparador} b / 2")['ast']['corpo'][0]['valor']
    assert valor["tipo"] == "Comparacao" and valor["operador"] == comparador
    assert valor["esquerda"]["operador"] == "+"
    assert valor["direita"]["operador"] == "/"


def test_sintaxe_invalida_com_mais_de_um_comando_na_linha():
    erro, = analisar("x = 1 y = 2")["erros_sintaticos"]
    assert erro["esperado"] == "NEWLINE"
    assert (erro["encontrado"], erro["linha"], erro["coluna"]) == ("y", 1, 7)


def test_recuo_so_depois_de_cabecalho():
    erro, = analisar("    x = 1")["erros_sintaticos"]
    assert erro["encontrado"] == "INDENT"
    assert erro["regra"] == "comando"


def test_parser_preserva_tokens_publicos():
    # Não acrescenta EOF aos tokens públicos antes de expô-los na tabela.
    codigo = "x = (1\n    + 2)  # comentários não viram tokens"
    tokens = scanner.analisar(codigo)["tokens"]
    originais = [dict(token) for token in tokens]
    resposta = parser.analisar(tokens, codigo)
    assert resposta["estado_sintatico"] == "valido"
    assert tokens == originais


def test_nomes_iguais_a_categorias_continuam_sendo_identificadores():
    codigo = "EOF = 1\nif EOF:\n    DEDENT = NEWLINE\n    INDENT = IDENTIFICADOR\nNEWLINE = INDENT"
    corpo = analisar(codigo)["ast"]["corpo"]
    assert [corpo[0]["alvo"]["identificador"], corpo[2]["alvo"]["identificador"]] == ["EOF", "NEWLINE"]
    assert [no["alvo"]["identificador"] for no in corpo[1]["entao"]] == ["DEDENT", "INDENT"]
