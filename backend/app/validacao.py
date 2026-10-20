"""Regras de validação e resumo da entrada. Não depende de nenhuma biblioteca externa."""
from dataclasses import dataclass
from typing import Optional

TAMANHO_MAXIMO = 10_000  # caracteres

MSG_ENTRADA_VAZIA = "Informe um código-fonte antes de solicitar a análise."
MSG_REQUISICAO_INVALIDA = 'Requisição inválida. Envie um JSON no formato {"codigo": "<texto>"}.'
MSG_ENTRADA_GRANDE = f"O código excede o limite de {TAMANHO_MAXIMO} caracteres."
MSG_ERRO_INTERNO = "Ocorreu um erro inesperado ao processar o código. Tente novamente em instantes."
MSG_SUCESSO = "Código recebido com sucesso."


@dataclass(frozen=True)
class ErroValidacao:
    tipo: str
    mensagem: str
    status: int


def validar_codigo(codigo) -> Optional[ErroValidacao]:
    """Retorna None se a entrada pode ser processada; caso contrário, o erro correspondente.

    Só verifica se há conteúdo e se o tamanho é aceitável. Não verifica se o programa
    está correto: entradas com erros intencionais são aceitas.
    """
    if not isinstance(codigo, str):
        return ErroValidacao("requisicao_invalida", MSG_REQUISICAO_INVALIDA, 400)
    if codigo.strip() == "":
        return ErroValidacao("entrada_vazia", MSG_ENTRADA_VAZIA, 400)
    if len(codigo) > TAMANHO_MAXIMO:
        return ErroValidacao("entrada_muito_grande", MSG_ENTRADA_GRANDE, 413)
    return None


def resumir(codigo: str) -> dict:
    """Resumo simples do código recebido (as análises de verdade virão nas próximas etapas)."""
    return {"linhas": len(codigo.splitlines()), "caracteres": len(codigo)}
