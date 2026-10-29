"""Contrato e casos de borda do scanner, independentes de parser/execução."""
import pytest
from app.scanner import analisar, OPERADORES, PALAVRAS_RESERVADAS, DELIMITADORES


def significativos(codigo):
    return [t for t in analisar(codigo)["tokens"] if t["tipo"] not in {"NEWLINE", "INDENT", "DEDENT"}]


@pytest.mark.parametrize("palavra", sorted(PALAVRAS_RESERVADAS))
def test_cada_palavra_reservada(palavra):
    assert significativos(palavra)[0] == {"tipo": "PALAVRA_RESERVADA", "lexema": palavra, "linha": 1, "coluna": 1}


@pytest.mark.parametrize("nome", ["a", "resultado", "_x1", "nome_2", "ifx", "elsewhere"])
def test_identificadores(nome):
    assert significativos(nome)[0]["tipo"] == "IDENTIFICADOR"


@pytest.mark.parametrize("literal,tipo", [("0", "LITERAL_INTEIRO"), ("42", "LITERAL_INTEIRO"), ("2.5", "LITERAL_REAL"), (".5", "LITERAL_REAL"), ("5.", "LITERAL_REAL")])
def test_literais(literal, tipo):
    assert analisar(literal)["sucesso"]
    assert significativos(literal)[0]["tipo"] == tipo


@pytest.mark.parametrize("literal", ["01", "123abc", "1.2.3", "1e3", "1_000"])
def test_numeros_malformados_sao_um_erro(literal):
    r = analisar(literal)
    assert not r["sucesso"]
    assert r["erros"][0]["lexema"] == literal
    assert r["erros"][0]["coluna"] == 1


@pytest.mark.parametrize("op", sorted(OPERADORES))
def test_cada_operador_e_agrupado(op):
    assert significativos(op) == [{"tipo": "OPERADOR", "lexema": op, "linha": 1, "coluna": 1}]


@pytest.mark.parametrize("d", sorted(DELIMITADORES))
def test_cada_delimitador(d):
    assert significativos(d)[0]["tipo"] == "DELIMITADOR"


@pytest.mark.parametrize("codigo", ["", " \n\t", "# apenas comentário", "  # comentário\n\n"])
def test_bordas_sem_tokens(codigo):
    r = analisar(codigo)
    assert r["tokens"] == []
    # Tabulações na margem são explicitamente diagnosticadas, mesmo sem código.
    if "\t" not in codigo:
        assert r["sucesso"]


def test_comentario_e_ignorado_e_preserva_posicoes():
    r = analisar("# comentário\nx = 10 # anotação\ny=2")
    assert r["sucesso"]
    t = significativos("# comentário\nx = 10 # anotação\ny=2")
    assert t[0] == {"tipo": "IDENTIFICADOR", "lexema": "x", "linha": 2, "coluna": 1}
    assert t[2]["coluna"] == 5
    assert t[-1]["linha"] == 3


def test_recuos_e_quebras_sao_observaveis():
    r = analisar("if x > 0:\n    y = 2\nelse:\n    y = 3\n")
    assert r["sucesso"]
    tipos = [t["tipo"] for t in r["tokens"]]
    assert tipos.count("INDENT") == 2
    assert tipos.count("DEDENT") == 2
    assert tipos.count("NEWLINE") == 4


def test_tab_e_recuo_inconsistente_nao_quebram():
    r = analisar("if x:\n    x=1\n  y=2\n\tz=3")
    assert not r["sucesso"]
    assert any("recuo" in e["mensagem"] for e in r["erros"])
    assert any("tabulação" in e["mensagem"] for e in r["erros"])


def test_erros_multiplos_recuperam_tokens_seguintes():
    r = analisar("x = @ 2\ny = $ 3")
    assert len(r["erros"]) == 2
    assert [(e["linha"], e["coluna"]) for e in r["erros"]] == [(1, 5), (2, 5)]
    assert any(t["lexema"] == "3" for t in r["tokens"])


@pytest.mark.parametrize("codigo", ["x = 10 +", "if x > :", "x = = 2", "("])
def test_sintaxe_nao_e_validada(codigo):
    assert analisar(codigo)["sucesso"]


@pytest.mark.parametrize("codigo", ["while", "True", "'texto'", "\"aberto", "x ** 2", "x += 1", "ação"])
def test_construcoes_fora_do_subconjunto(codigo):
    r = analisar(codigo)
    assert not r["sucesso"]
    assert all(e["tipo"] == "ERRO_LEXICO" for e in r["erros"])


def test_operadores_compostos_usam_maior_lexema():
    assert [t["lexema"] for t in significativos("a<=b!=c==d>=e")] == ["a", "<=", "b", "!=", "c", "==", "d", ">=", "e"]


def test_newline_crlf_e_fim_sem_newline():
    r = analisar("x=1\r\ny=2")
    assert r["sucesso"]
    assert significativos("x=1\r\ny=2")[-1] == {"tipo": "LITERAL_INTEIRO", "lexema": "2", "linha": 2, "coluna": 3}


def test_quebra_dentro_parenteses_nao_cria_bloco():
    r = analisar("x = (1 +\n    2)\n")
    assert r["sucesso"]
    assert not any(t["tipo"] == "INDENT" for t in r["tokens"])


def test_nao_executa_codigo():
    r = analisar("__import__('os').system('echo proibido')")
    assert isinstance(r["tokens"], list)
    assert not r["sucesso"]
