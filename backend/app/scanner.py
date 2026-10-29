"""Scanner didático de um subconjunto de Python; nunca executa a entrada.

Posições são baseadas em 1 e contam caracteres, não largura visual. NEWLINE,
INDENT e DEDENT tornam observável a delimitação léxica dos blocos.
"""
import keyword
import re

PALAVRAS_RESERVADAS = {"if", "else"}
OPERADORES = {"+", "-", "*", "/", "=", "==", "!=", "<=", ">=", "<", ">"}
DELIMITADORES = {"(", ")", ":"}
OPERADORES_FORA_ESCOPO = {"**", "//", "+=", "-=", "*=", "/=", ":=", "<<", ">>", "->", "%=", "&=", "|=", "^="}
NUMERO = re.compile(r"(?:[0-9]+\.[0-9]*|\.[0-9]+|0|[1-9][0-9]*)\Z")


def analisar(codigo: str) -> dict:
    tokens, erros = [], []
    recuos = [0]
    parenteses = 0
    linhas = codigo.splitlines(keepends=True)

    def token(tipo, lexema, linha, coluna):
        tokens.append({"tipo": tipo, "lexema": lexema, "linha": linha, "coluna": coluna})

    def erro(lexema, linha, coluna, motivo):
        erros.append({"tipo": "ERRO_LEXICO", "lexema": lexema, "linha": linha,
                      "coluna": coluna, "mensagem": f"Erro léxico na linha {linha}, coluna {coluna}: {motivo}"})

    for numero_linha, original in enumerate(linhas, 1):
        texto = original.rstrip("\r\n")
        i = 0
        while i < len(texto) and texto[i] in " \t":
            if texto[i] == "\t":
                erro("\t", numero_linha, i + 1, "tabulação fora do subconjunto; use espaços (recomendação: quatro por nível).")
            i += 1
        if not texto[i:] or texto[i:].startswith("#"):
            continue
        if parenteses == 0:
            recuo = len(texto[:i].expandtabs(4))
            if recuo > recuos[-1]:
                recuos.append(recuo)
                token("INDENT", texto[:i], numero_linha, 1)
            elif recuo < recuos[-1]:
                while len(recuos) > 1 and recuo < recuos[-1]:
                    recuos.pop()
                    token("DEDENT", "", numero_linha, i + 1)
                if recuo != recuos[-1]:
                    erro(texto[:i], numero_linha, 1, "recuo não corresponde a um nível anterior; alinhe os blocos com espaços.")
        while i < len(texto):
            inicio = i
            c = texto[i]
            if c in " \t":
                i += 1
                continue
            if c == "#":
                break
            if c in "\"'":
                aspas = c
                i += 1
                while i < len(texto):
                    if texto[i] == "\\":
                        i += 2
                    elif texto[i] == aspas:
                        i += 1
                        break
                    else:
                        i += 1
                lexema = texto[inicio:i]
                fechado = len(lexema) >= 2 and lexema[-1] == aspas
                erro(lexema, numero_linha, inicio + 1,
                     "strings não fazem parte deste subconjunto." if fechado else "literal de texto não fechado; strings também estão fora do subconjunto.")
                continue
            if c.isascii() and (c.isalpha() or c == "_"):
                i += 1
                while i < len(texto) and texto[i].isascii() and (texto[i].isalnum() or texto[i] == "_"):
                    i += 1
                lexema = texto[inicio:i]
                if keyword.iskeyword(lexema) and lexema not in PALAVRAS_RESERVADAS:
                    erro(lexema, numero_linha, inicio + 1, f"palavra reservada '{lexema}' fora do subconjunto; nesta etapa use if/else.")
                else:
                    token("PALAVRA_RESERVADA" if lexema in PALAVRAS_RESERVADAS else "IDENTIFICADOR", lexema, numero_linha, inicio + 1)
                continue
            if c in "0123456789" or (c == "." and i + 1 < len(texto) and texto[i + 1] in "0123456789"):
                i += 1
                while i < len(texto) and (texto[i].isalnum() or texto[i] in "_."):
                    i += 1
                lexema = texto[inicio:i]
                if NUMERO.fullmatch(lexema):
                    token("LITERAL_REAL" if "." in lexema else "LITERAL_INTEIRO", lexema, numero_linha, inicio + 1)
                else:
                    erro(lexema, numero_linha, inicio + 1, f"literal numérico malformado '{lexema}'; use inteiros decimais ou reais como 2.5, sem letras ou separadores.")
                continue
            dois = texto[i:i + 2]
            if dois in OPERADORES_FORA_ESCOPO:
                erro(dois, numero_linha, i + 1, f"operador '{dois}' fora do subconjunto documentado.")
                i += 2
                continue
            if dois in OPERADORES:
                token("OPERADOR", dois, numero_linha, i + 1)
                i += 2
                continue
            if c in OPERADORES:
                token("OPERADOR", c, numero_linha, i + 1)
            elif c in DELIMITADORES:
                token("DELIMITADOR", c, numero_linha, i + 1)
                if c == "(":
                    parenteses += 1
                elif c == ")":
                    parenteses = max(0, parenteses - 1)
            else:
                erro(c, numero_linha, i + 1, f"caractere não reconhecido {c!r}. Consulte o subconjunto suportado.")
            i += 1
        if parenteses == 0:
            token("NEWLINE", original[len(texto):] or "", numero_linha, len(texto) + 1)
    linha_fim = len(linhas) + 1 if codigo.endswith(("\n", "\r")) else max(1, len(linhas))
    coluna_fim = 1 if codigo.endswith(("\n", "\r")) or not linhas else len(linhas[-1]) + 1
    while len(recuos) > 1:
        recuos.pop()
        token("DEDENT", "", linha_fim, coluna_fim)
    return {"sucesso": not erros, "tokens": tokens, "erros": erros}
