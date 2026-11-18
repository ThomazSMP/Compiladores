# Contrato atual e extensão proposta - Etapa 4

Consulta ao código: commit-base `5d9d81acfff427d07e4f2229a9a363948a737835`, em 18/11/2026.

## Implementado

`POST /api/analisar`, requisição JSON: `{"codigo":"x = 1"}`.

O backend valida tipo, conteúdo e limite de 10.000 caracteres. Retorna HTTP 400 para corpo/entrada inválidos, 413 para excesso de tamanho e 200 para processamento léxico concluído, mesmo se houver erros reconhecidos.

Campos atuais: `recebido`, `mensagem`, `resumo`, `sucesso`, `tokens`, `erros`. `sucesso` significa sucesso **léxico**. Os tokens contêm `tipo`, `lexema`, `linha`, `coluna`. Erros léxicos acrescentam `mensagem`. As posições começam em 1. `erros` não contém erros sintáticos nesta revisão. A mensagem de recebimento não substitui a leitura de `sucesso`.

## Proposto; ainda não implementado

A extensão preservará os campos e acrescentará:

```json
{
  "estado_sintatico": "valido",
  "ast": {
    "tipo": "Programa",
    "corpo": [{
      "tipo": "Atribuicao",
      "alvo": {"tipo": "Nome", "identificador": "x"},
      "valor": {"tipo": "Numero", "lexema": "1", "categoria": "inteiro"}
    }]
  },
  "erros_sintaticos": []
}
```

Este exemplo é **esqueleto esperado**, não resposta emitida pelo backend atual. Na implementação, cada nó também deverá receber um identificador estável na resposta e posição de origem (`linha`, `coluna`, `linha_fim`, `coluna_fim`). Os esqueletos nos casos de teste verificam estrutura e agrupamento; testes específicos deverão conferir posições, sem fazer comparação tautológica com a própria saída do parser.

Estados propostos:

| Situação | `sucesso` legado | `estado_sintatico` | `ast` | `erros_sintaticos` |
|---|---|---|---|---|
| Erro léxico | `false` | `nao_executado` | `null` | `[]` |
| Léxico válido e sintaxe aceita | `true` | `valido` | objeto | `[]` |
| Léxico válido e sintaxe recusada | `true` | `invalido` | `null` | primeiro diagnóstico |

Um diagnóstico sintático proposto conterá `tipo: ERRO_SINTATICO`, `esperado`, `encontrado`, `linha`, `coluna` e `mensagem`. EOF terá posição derivada do fim do texto; `encontrado` será `EOF`, sem inventar um lexema presente no código. Ao exceder 64 níveis, informar limite do ambiente, distinguindo-o de erro na linguagem Python completa.

O frontend futuro deverá ler os estados das fases: `sucesso: true` isoladamente não confirma sintaxe válida. Não haverá AST válida parcial no caminho de erro. O estado semântico e a tabela de símbolos serão especificados e implementados na Etapa 5; nesta etapa não se retornará uma lista vazia como se essa análise tivesse sido realizada.

## Estruturas previstas

`Programa(corpo)`, `Atribuicao(alvo,valor)`, `Nome(identificador)`, `Numero(lexema,categoria)`, `Binaria(operador,esquerda,direita)`, `Unaria(operador,operando)`, `Comparacao(operador,esquerda,direita)` e `Se(condicao,entao,senao)`. A gramática completa do recorte está em `gramatica.ebnf`; os esquemas concretos de referência estão em `casos-de-teste.json`. Parênteses e dois-pontos orientam a análise, mas não se tornam nós de pontuação da AST.
