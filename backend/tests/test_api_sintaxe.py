"""Verifica a extensão do contrato HTTP sem depender da interface."""
import pytest
from fastapi.testclient import TestClient

from app import main, scanner


client = TestClient(main.app, raise_server_exceptions=False)


def analisar(codigo):
    return client.post("/api/analisar", json={"codigo": codigo})


def test_tokens_da_tabela_sao_os_mesmos_que_o_parser_recebe(monkeypatch):
    resultado = {}
    analisar_sintaxe = main.parser.analisar

    def observar_entrada(tokens, codigo):
        resultado["tokens_parser"] = [dict(token) for token in tokens]
        return analisar_sintaxe(tokens, codigo)

    monkeypatch.setattr(main.parser, "analisar", observar_entrada)
    codigo = "x = (ab + 12)\n"
    resposta = analisar(codigo)
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["estado_sintatico"] == "valido"
    assert corpo["erros_sintaticos"] == []
    assert corpo["tokens"] == resultado["tokens_parser"] == scanner.analisar(codigo)["tokens"]
    assert all(t["tipo"] != "EOF" for t in corpo["tokens"])
    soma = corpo["ast"]["corpo"][0]["valor"]
    assert (soma["esquerda"]["identificador"], soma["esquerda"]["coluna"]) == ("ab", 6)
    assert (soma["direita"]["lexema"], soma["direita"]["coluna"]) == ("12", 11)


def test_parser_nao_e_invocado_se_lexico_falhar_ct17(monkeypatch):
    def parser_indevido(*args):
        pytest.fail("o parser foi chamado com sequência léxica inválida")

    monkeypatch.setattr(main.parser, "analisar", parser_indevido)
    resposta = analisar("x = @ 2\ny = 3")
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["sucesso"] is False
    assert corpo["erros"][0]["lexema"] == "@"
    assert corpo["tokens"][-2]["lexema"] == "3"
    assert corpo["estado_sintatico"] == "nao_executado"
    assert corpo["ast"] is None and corpo["erros_sintaticos"] == []


def test_erro_sintatico_preserva_sucesso_lexico_e_mostra_primeiro_diagnostico():
    resposta = analisar("x = 2 +\ny = = 3")
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["sucesso"] is True and corpo["erros"] == []
    assert corpo["estado_sintatico"] == "invalido" and corpo["ast"] is None
    erro, = corpo["erros_sintaticos"]
    assert (erro["linha"], erro["coluna"], erro["esperado"], erro["encontrado"]) == (1, 8, "expressao_primaria", "NEWLINE")
    assert "linha 1, coluna 8" in erro["mensagem"] and "identificador" in erro["mensagem"]


def test_programa_com_apenas_comentario_ct38():
    resposta = analisar("# apenas comentário")
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["sucesso"] and corpo["tokens"] == []
    assert corpo["estado_sintatico"] == "valido"
    assert corpo["ast"] == {
        "id": "n1", "tipo": "Programa", "corpo": [],
        "linha": 1, "coluna": 20, "linha_fim": 1, "coluna_fim": 20,
    }


@pytest.mark.parametrize("codigo,status,tipo", [("", 400, "entrada_vazia"), ("x" * 10_001, 413, "entrada_muito_grande")])
def test_validacao_legada_precede_a_analise(codigo, status, tipo):
    resposta = analisar(codigo)
    assert resposta.status_code == status
    assert resposta.json()["erro"]["tipo"] == tipo
    assert "estado_sintatico" not in resposta.json()


def test_64_blocos_e_64_parenteses_podem_ser_analisados_e_serializados():
    codigo = "".join(f"{' ' * nivel}if 1:\n" for nivel in range(64))
    codigo += " " * 64 + "x = " + "(" * 64 + "1" + ")" * 64
    resposta = analisar(codigo)
    assert resposta.status_code == 200
    assert resposta.json()["estado_sintatico"] == "valido"


def test_65_blocos_superam_limite_de_aninhamento():
    codigo = "".join(f"{' ' * nivel}if 1:\n" for nivel in range(65))
    codigo += " " * 65 + "x = 1"
    resposta = analisar(codigo)
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["estado_sintatico"] == "invalido"
    erro, = corpo["erros_sintaticos"]
    assert (erro["tipo"], erro["regra"], erro["limite"]) == ("limite_aninhamento_excedido", "bloco", 64)


@pytest.mark.parametrize("valor", ["+" * 1500 + "1", "1+" * 1500 + "1"])
def test_operacoes_demasiado_profundas_retornam_diagnostico_e_nao_500(valor):
    resposta = analisar(f"x = {valor}")
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["estado_sintatico"] == "invalido" and corpo["ast"] is None
    erro, = corpo["erros_sintaticos"]
    assert (erro["tipo"], erro["limite"]) == ("limite_profundidade_ast_excedido", 128)


def test_operacoes_no_limite_da_arvore_sao_serializaveis():
    resposta = analisar(f"x = {'1+' * 125}1")
    assert resposta.status_code == 200
    assert resposta.json()["estado_sintatico"] == "valido"
