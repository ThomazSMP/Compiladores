"""Comparação independente da estrutura da AST para casos válidos do recorte."""
import ast
import json
import os
import random
import urllib.request


url = os.environ.get('BASE_URL', 'http://localhost:8080') + '/api/analisar'
rng = random.Random(20261124)
operadores = {
    ast.Add: '+', ast.Sub: '-', ast.Mult: '*', ast.Div: '/', ast.UAdd: '+',
    ast.USub: '-', ast.Eq: '==', ast.NotEq: '!=', ast.Lt: '<', ast.LtE: '<=',
    ast.Gt: '>', ast.GtE: '>=',
}


def normalizar_python(no):
    match no:
        case ast.Module(body=corpo):
            return 'Programa', tuple(map(normalizar_python, corpo))
        case ast.Assign(targets=[alvo], value=valor):
            return 'Atribuicao', normalizar_python(alvo), normalizar_python(valor)
        case ast.BinOp(left=esquerda, op=op, right=direita):
            return 'Binaria', operadores[type(op)], normalizar_python(esquerda), normalizar_python(direita)
        case ast.Compare(left=esquerda, ops=[op], comparators=[direita]):
            return 'Comparacao', operadores[type(op)], normalizar_python(esquerda), normalizar_python(direita)
        case ast.UnaryOp(op=op, operand=operando):
            return 'Unaria', operadores[type(op)], normalizar_python(operando)
        case ast.If(test=condicao, body=entao, orelse=senao):
            return 'Se', normalizar_python(condicao), tuple(map(normalizar_python, entao)), tuple(map(normalizar_python, senao))
        case ast.Constant(value=valor):
            return 'Numero', valor
        case ast.Name(id=nome):
            return 'Nome', nome
    raise ValueError(ast.dump(no))


def normalizar_projeto(no):
    match no:
        case {'tipo': 'Programa', 'corpo': corpo}:
            return 'Programa', tuple(map(normalizar_projeto, corpo))
        case {'tipo': 'Atribuicao', 'alvo': alvo, 'valor': valor}:
            return 'Atribuicao', normalizar_projeto(alvo), normalizar_projeto(valor)
        case {'tipo': ('Binaria' | 'Comparacao') as tipo, 'operador': op, 'esquerda': esquerda, 'direita': direita}:
            return tipo, op, normalizar_projeto(esquerda), normalizar_projeto(direita)
        case {'tipo': 'Unaria', 'operador': op, 'operando': operando}:
            return 'Unaria', op, normalizar_projeto(operando)
        case {'tipo': 'Se', 'condicao': condicao, 'entao': entao, 'senao': senao}:
            return 'Se', normalizar_projeto(condicao), tuple(map(normalizar_projeto, entao)), tuple(map(normalizar_projeto, senao))
        case {'tipo': 'Numero', 'lexema': valor, 'categoria': categoria}:
            return 'Numero', int(valor) if categoria == 'inteiro' else float(valor)
        case {'tipo': 'Nome', 'identificador': nome}:
            return 'Nome', nome
    raise ValueError(no)


def expressao(nivel=0):
    bases = ('0', '1', '27', '8.0', '2.', '.3', 'x', 'y')
    if nivel >= 3 or rng.randrange(4) == 0:
        return rng.choice(bases)
    if rng.randrange(4) == 0:
        return rng.choice('+-') + expressao(nivel + 1)
    operacao = f'{expressao(nivel + 1)} {rng.choice("+-*/")} {expressao(nivel + 1)}'
    return f'({operacao})' if rng.randrange(2) else operacao


def programa(nivel=0):
    margem = '    ' * nivel
    saida = [f'{margem}{rng.choice("xy")} = {expressao()}']
    if nivel < 3 and rng.randrange(3) != 0:
        op = rng.choice(('==', '!=', '<', '<=', '>', '>='))
        saida.append(f'{margem}if {expressao()} {op} {expressao()}:')
        saida.extend(programa(nivel + 1))
        if rng.randrange(2):
            saida.append(f'{margem}else:')
            saida.extend(programa(nivel + 1))
    return saida


def analisar(texto):
    corpo = json.dumps({'codigo': texto}).encode('utf-8')
    requisicao = urllib.request.Request(url, data=corpo, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(requisicao, timeout=8) as resposta:
        return json.load(resposta)


if __name__ == '__main__':
    for i in range(120):
        texto = '\n'.join(programa()) + ('\n' if i % 2 else '')
        esperado = normalizar_python(ast.parse(texto))
        resultado = analisar(texto)
        assert resultado['estado_sintatico'] == 'valido', (i, texto, resultado['erros_sintaticos'])
        assert normalizar_projeto(resultado['ast']) == esperado, (i, texto)
    print('120 programas gerados com AST estruturalmente equivalente à de CPython.')
