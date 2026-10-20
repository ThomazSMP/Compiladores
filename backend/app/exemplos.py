"""Programas de exemplo, no subconjunto de Python previsto para o projeto."""

EXEMPLOS = [
    {
        "id": "atribuicao",
        "titulo": "Atribuição de variáveis",
        "descricao": "Declaração implícita de variáveis com literais inteiros e de ponto flutuante.",
        "codigo": "x = 10\ny = 2.5\n",
    },
    {
        "id": "aritmetica",
        "titulo": "Operações aritméticas",
        "descricao": "Operadores +, -, * e / com parênteses e precedência.",
        "codigo": "a = 10\nb = 5\nresultado = (a + b) * 2 - 3 / 1\n",
    },
    {
        "id": "condicional",
        "titulo": "Estrutura condicional",
        "descricao": "if/else com operador relacional e blocos delimitados por indentação.",
        "codigo": "numero = 10\nif numero > 0:\n    numero = numero + 1\nelse:\n    numero = 0\n",
    },
    {
        "id": "erro-intencional",
        "titulo": "Código com erro intencional",
        "descricao": "Programa com erros de propósito, para as etapas em que os analisadores identificarão problemas.",
        "codigo": "x = 10 +\nif x > :\n    y = = 2\n",
    },
]


def listar() -> list:
    return [dict(exemplo) for exemplo in EXEMPLOS]
