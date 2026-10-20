"""API do software educacional.

Etapa 2: recebe o código-fonte, valida a entrada e devolve uma resposta estruturada.
As análises léxica, sintática e semântica serão acrescentadas nas próximas etapas.
"""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, StrictStr

from . import exemplos, validacao

logger = logging.getLogger("app")

app = FastAPI(
    title="Software Educacional de Análise de Código",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)


class RequisicaoAnalise(BaseModel):
    codigo: StrictStr


def resposta_erro(status: int, tipo: str, mensagem: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"recebido": False, "erro": {"tipo": tipo, "mensagem": mensagem}},
    )


@app.exception_handler(RequestValidationError)
async def tratar_requisicao_invalida(request: Request, exc: RequestValidationError):
    # Corpo ausente, JSON malformado ou campo "codigo" ausente/de tipo errado.
    return resposta_erro(400, "requisicao_invalida", validacao.MSG_REQUISICAO_INVALIDA)


@app.exception_handler(Exception)
async def tratar_erro_inesperado(request: Request, exc: Exception):
    # Detalhes ficam só no log do servidor; o usuário recebe uma mensagem genérica.
    logger.exception("Erro inesperado em %s", request.url.path)
    return resposta_erro(500, "erro_interno", validacao.MSG_ERRO_INTERNO)


@app.get("/api/hello")
def hello():
    """Endpoint da etapa 1, mantido (também usado pelo healthcheck do Compose)."""
    return {"message": "Hello, World!"}


@app.get("/api/exemplos")
def listar_exemplos():
    return {"exemplos": exemplos.listar()}


@app.post("/api/analisar")
def analisar(requisicao: RequisicaoAnalise):
    erro = validacao.validar_codigo(requisicao.codigo)
    if erro is not None:
        return resposta_erro(erro.status, erro.tipo, erro.mensagem)
    return {
        "recebido": True,
        "mensagem": validacao.MSG_SUCESSO,
        "resumo": validacao.resumir(requisicao.codigo),
    }
