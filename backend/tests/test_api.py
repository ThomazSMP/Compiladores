"""Testes dos endpoints (contrato HTTP). Exigem fastapi e httpx: rodam no estágio `test` do Docker."""
import pytest
from fastapi.testclient import TestClient

from app import exemplos, main, validacao

client = TestClient(main.app, raise_server_exceptions=False)


def analisar(corpo):
    return client.post("/api/analisar", json=corpo)


# ---- regressão da etapa 1 ----
def test_hello_continua_funcionando():
    resposta = client.get("/api/hello")
    assert resposta.status_code == 200
    assert resposta.json() == {"message": "Hello, World!"}


# ---- exemplos ----
def test_exemplos_retorna_lista_com_o_formato_esperado():
    resposta = client.get("/api/exemplos")
    assert resposta.status_code == 200
    lista = resposta.json()["exemplos"]
    assert len(lista) >= 3
    for exemplo in lista:
        assert set(exemplo) == {"id", "titulo", "descricao", "codigo"}


@pytest.mark.parametrize("exemplo", exemplos.listar(), ids=lambda e: e["id"])
def test_cada_exemplo_e_aceito_pela_analise(exemplo):
    resposta = analisar({"codigo": exemplo["codigo"]})
    assert resposta.status_code == 200
    assert resposta.json()["recebido"] is True


# ---- requisições válidas ----
def test_codigo_valido_retorna_200_e_resumo():
    resposta = analisar({"codigo": "x = 10"})
    assert resposta.status_code == 200
    assert resposta.headers["content-type"].startswith("application/json")
    assert resposta.json() == {
        "recebido": True,
        "mensagem": "Código recebido com sucesso.",
        "resumo": {"linhas": 1, "caracteres": 6},
    }


def test_codigo_com_varias_linhas_e_indentacao():
    resposta = analisar({"codigo": "if x > 0:\n    x = x + 1\n"})
    assert resposta.status_code == 200
    assert resposta.json()["resumo"] == {"linhas": 2, "caracteres": 24}


def test_caracteres_especiais_e_unicode():
    codigo = "texto = 'ação ✓ 日本'  # $ % & < > \" \\"
    resposta = analisar({"codigo": codigo})
    assert resposta.status_code == 200
    assert resposta.json()["resumo"]["caracteres"] == len(codigo)


def test_codigo_com_erro_de_sintaxe_e_recebido_normalmente():
    resposta = analisar({"codigo": "x = = 5 +"})
    assert resposta.status_code == 200
    assert resposta.json()["recebido"] is True


def test_campos_extras_sao_ignorados():
    resposta = analisar({"codigo": "x = 1", "extra": "ignorado"})
    assert resposta.status_code == 200


# ---- validações e erros ----
def assert_erro(resposta, status, tipo, mensagem=None):
    assert resposta.status_code == status
    corpo = resposta.json()
    assert corpo["recebido"] is False
    assert corpo["erro"]["tipo"] == tipo
    if mensagem is not None:
        assert corpo["erro"]["mensagem"] == mensagem
    # Não deve vazar detalhes internos do framework.
    assert "detail" not in corpo
    assert "Traceback" not in resposta.text


def test_entrada_vazia():
    resposta = analisar({"codigo": ""})
    assert_erro(resposta, 400, "entrada_vazia", "Informe um código-fonte antes de solicitar a análise.")


@pytest.mark.parametrize("texto", ["   ", "\n\n", "\t  \r\n"])
def test_entrada_somente_espacos(texto):
    assert_erro(analisar({"codigo": texto}), 400, "entrada_vazia")


def test_campo_codigo_ausente():
    assert_erro(analisar({}), 400, "requisicao_invalida")


@pytest.mark.parametrize("valor", [123, None, True, ["x"], {"a": 1}])
def test_campo_codigo_com_tipo_invalido(valor):
    assert_erro(analisar({"codigo": valor}), 400, "requisicao_invalida")


def test_json_malformado():
    resposta = client.post(
        "/api/analisar", content="{nao e json", headers={"Content-Type": "application/json"}
    )
    assert_erro(resposta, 400, "requisicao_invalida")


@pytest.mark.parametrize("corpo", [[], "texto", 42])
def test_corpo_que_nao_e_objeto(corpo):
    assert_erro(analisar(corpo), 400, "requisicao_invalida")


def test_requisicao_sem_corpo():
    assert_erro(client.post("/api/analisar"), 400, "requisicao_invalida")


def test_entrada_muito_grande():
    resposta = analisar({"codigo": "a" * (validacao.TAMANHO_MAXIMO + 1)})
    assert_erro(resposta, 413, "entrada_muito_grande")


def test_metodo_get_nao_e_permitido():
    assert client.get("/api/analisar").status_code == 405


def test_erro_inesperado_devolve_mensagem_generica(monkeypatch):
    def quebra(_codigo):
        raise RuntimeError("segredo em /app/interno/arquivo.py")

    monkeypatch.setattr(main.validacao, "resumir", quebra)
    resposta = analisar({"codigo": "x = 1"})
    assert_erro(resposta, 500, "erro_interno", validacao.MSG_ERRO_INTERNO)
    assert "segredo" not in resposta.text
    assert "/app" not in resposta.text
