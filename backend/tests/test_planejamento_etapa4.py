"""Plano previamente definido: executa apenas fases já disponíveis.

Parser/AST/semântica permanecem pendentes com skip explícito. Este módulo não
implementa nem simula um parser para transformar planejamento em aprovação.
"""
import json
from pathlib import Path
import pytest
from app.scanner import analisar
from app.validacao import validar_codigo


def carregar_plano():
    aqui = Path(__file__).resolve()
    candidatos = [aqui.parents[2] / "docs/etapa4/casos-de-teste.json",
                  aqui.parents[1] / "docs/etapa4/casos-de-teste.json"]
    for caminho in candidatos:
        if caminho.is_file():
            return json.loads(caminho.read_text(encoding="utf-8"))
    pytest.skip("Plano canônico indisponível: monte docs em /code/docs no serviço backend-tests.", allow_module_level=True)


PLANO = carregar_plano()
CASOS = PLANO["casos"]


def test_plano_tem_identificadores_unicos_e_expectativas():
    assert PLANO["versao"] == "1.0"
    assert len(CASOS) == 40
    assert len({c["id"] for c in CASOS}) == 40
    assert all(c["expectativa"] and c["criterios"] for c in CASOS)


def test_plano_nao_contem_resultados_fabricados():
    assert all(c["estado_avaliacao"] == "PENDENTE" for c in CASOS)
    assert all(c["resultado_observado"] is None for c in CASOS)


def test_ast_oraculos_explicitos_independem_do_parser():
    por_id = {c["id"]: c for c in CASOS}
    a = por_id["CT-02"]["expectativa"]["sintatico"]["ast"]["corpo"][0]["valor"]
    b = por_id["CT-03"]["expectativa"]["sintatico"]["ast"]["corpo"][0]["valor"]
    assert a["operador"] == "+" and a["direita"]["operador"] == "*"
    assert b["operador"] == "*" and b["esquerda"]["operador"] == "+"


@pytest.mark.parametrize("caso", CASOS, ids=lambda c: c["id"])
def test_fase_disponivel_do_caso_planejado(caso):
    fase = caso["fase_alvo"]
    if fase == "sintatica":
        pytest.skip("Parser/AST propostos, ainda não implementados: caso não aprovado nem reprovado.")
    if fase == "semantica":
        pytest.skip("Verificação semântica reservada à Etapa 5, ainda não implementada.")
    if fase == "entrada":
        esperado = caso["expectativa"]["validacao"]
        erro = validar_codigo(caso["entrada"])
        assert erro is not None
        assert erro.status == esperado["http"] and erro.tipo == esperado["tipo"]
        return
    assert fase == "lexica"
    esperado = caso["expectativa"]["lexico"]
    observado = analisar(caso["entrada"])
    assert observado["sucesso"] is esperado["sucesso"]
    significativos = [t for t in observado["tokens"] if t["tipo"] not in {"NEWLINE","INDENT","DEDENT"}]
    tupla = lambda t: [t["tipo"], t["lexema"], t["linha"], t["coluna"]]
    if "tokens_significativos" in esperado:
        assert [tupla(t) for t in significativos] == esperado["tokens_significativos"]
    if "operadores" in esperado:
        assert [t["lexema"] for t in significativos if t["tipo"] == "OPERADOR"] == esperado["operadores"]
    if "contagem_tipos" in esperado:
        for tipo, quantidade in esperado["contagem_tipos"].items():
            assert sum(t["tipo"] == tipo for t in significativos) == quantidade
    if "primeiro_token" in esperado:
        assert tupla(significativos[0]) == esperado["primeiro_token"]
    if "ultimo_token_significativo" in esperado:
        assert tupla(significativos[-1]) == esperado["ultimo_token_significativo"]
    if "erros" in esperado:
        assert [[e["lexema"], e["linha"], e["coluna"]] for e in observado["erros"]] == esperado["erros"]
    if "mensagem_contem" in esperado:
        assert any(esperado["mensagem_contem"] in e["mensagem"] for e in observado["erros"])
    if "quantidade_tokens" in esperado:
        assert len(observado["tokens"]) == esperado["quantidade_tokens"]
