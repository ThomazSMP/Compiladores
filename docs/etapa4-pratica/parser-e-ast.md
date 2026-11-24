# Parser, AST e contrato da API

## Como o parser reconhece um programa

O FastAPI valida a entrada e chama o scanner. Quando o resultado léxico é bem-sucedido, o backend passa a lista de tokens e a fonte para `app.parser.analisar(tokens, codigo)`. O parser acrescenta internamente o marcador `EOF` para reconhecer o fim do programa e localizar construções incompletas. A lista de tokens pública permanece a mesma.

O analisador descendente recursivo foi escrito em Python, com rotinas correspondentes às produções da [gramática EBNF](gramatica.md). A categoria ou o lexema do próximo token permite distinguir uma atribuição de um condicional. Nos níveis aritméticos, cada operador binário combina uma expressão já reconhecida com a próxima expressão do nível mais forte. Esse procedimento forma, por exemplo, um nó de adição com a multiplicação como filho direito. A rotina de operadores unários lê os sinais na ordem da fonte e monta os nós do último sinal para o primeiro. A implementação manual torna essas decisões legíveis diretamente no código e dispensa gerador ou biblioteca de parsing.

O parser termina no primeiro erro sintático. O diagnóstico indica o ponto da falha, o elemento encontrado, o elemento esperado e a regra associada. O estudante pode corrigir a fonte e solicitar outra análise. Esse procedimento evita diagnósticos em cascata. Falhas léxicas são apresentadas em sua própria fase e suspendem o parser.

## AST e posições

A sequência de tokens contém categorias, lexemas e posições produzidos pelo scanner. Uma árvore de derivação exibe as aplicações das produções da gramática, inclusive símbolos intermediários e pontuação. A AST mantém a estrutura necessária para representar o programa. Por exemplo, o operador `=` aparece na relação entre alvo e valor do nó `Atribuicao`. Parênteses agrupam expressões, mas não criam um nó próprio. A interface exibe a AST.

| `tipo` | Campos do nó e seus valores |
|---|---|
| `Programa` | `corpo` contém a lista de comandos na ordem da fonte. |
| `Atribuicao` | `alvo` é um `Nome` e `valor` é uma expressão. |
| `Nome` | `identificador` guarda o nome tal como aparece na fonte. |
| `Numero` | `lexema` guarda o texto original e `categoria` informa `inteiro` ou `real`. |
| `Binaria` | `operador`, `esquerda` e `direita` representam `+`, `-`, `*` ou `/`. |
| `Unaria` | `operador` e `operando` representam `+` ou `-` aplicado a uma expressão. |
| `Comparacao` | `operador`, `esquerda` e `direita` representam a comparação. |
| `Se` | `condicao` é uma expressão, `entao` é a lista de comandos do primeiro ramo e `senao` é a lista do ramo alternativo. Sem `else`, `senao` vale `[]`. |

Todos os nós têm `id`, `tipo`, `linha`, `coluna`, `linha_fim` e `coluna_fim`. Os identificadores `n1`, `n2` e seguintes são atribuídos em pré-ordem, com a raiz antes de seus descendentes. Eles identificam nós dentro de uma resposta. As linhas e colunas começam em 1 e a posição final é exclusiva. Uma folha de `x` na primeira coluna termina na segunda. A posição da folha coincide com a do token, enquanto atribuições e condicionais cobrem as construções completas. Quando a entrada contém apenas comentários, a AST tem um `Programa` com corpo vazio, na posição de fim da fonte.

A relação entre os nós para `x = 2 + 3 * 4` é a seguinte.

```text
Programa
└── Atribuicao
    ├── alvo · Nome x
    └── valor · Binaria +
        ├── esquerda · Numero 2
        └── direita · Binaria *
            ├── esquerda · Numero 3
            └── direita · Numero 4
```

## Contrato de `POST /api/analisar`

O corpo da requisição continua sendo um objeto JSON com o campo textual `codigo`. O HTTP 200 indica que a API processou a requisição. Os estados das fases indicam se a entrada pertence à gramática.

Os campos da Etapa 3 continuam disponíveis. `recebido` confirma o recebimento e `resumo` descreve linhas e caracteres. `sucesso`, `tokens` e `erros` continuam sendo exclusivamente léxicos. Cada token inclui `tipo`, `lexema`, `linha` e `coluna`. Cada erro léxico acrescenta uma `mensagem`.

| Situação | `sucesso` léxico | `estado_sintatico` | `ast` | `erros_sintaticos` |
|---|---|---|---|---|
| Há erro léxico | `false` | `nao_executado` | `null` | `[]` |
| Léxico e sintaxe aceitos | `true` | `valido` | Objeto `Programa` | `[]` |
| Léxico aceito e sintaxe recusada | `true` | `invalido` | `null` | Primeiro diagnóstico |
| Léxico aceito e limite do parser atingido | `true` | `invalido` | `null` | Diagnóstico que identifica o limite da aplicação |

A requisição `{"codigo":"x = 1"}` retorna os campos abaixo. O exemplo mostra apenas os campos introduzidos na Etapa 4.

```json
{
  "estado_sintatico": "valido",
  "ast": {
    "tipo": "Programa",
    "id": "n1",
    "linha": 1,
    "coluna": 1,
    "linha_fim": 1,
    "coluna_fim": 6,
    "corpo": [
      {
        "tipo": "Atribuicao",
        "id": "n2",
        "linha": 1,
        "coluna": 1,
        "linha_fim": 1,
        "coluna_fim": 6,
        "alvo": {
          "tipo": "Nome", "id": "n3", "identificador": "x",
          "linha": 1, "coluna": 1, "linha_fim": 1, "coluna_fim": 2
        },
        "valor": {
          "tipo": "Numero", "id": "n4", "lexema": "1", "categoria": "inteiro",
          "linha": 1, "coluna": 5, "linha_fim": 1, "coluna_fim": 6
        }
      }
    ]
  },
  "erros_sintaticos": []
}
```

Em um diagnóstico de sintaxe, `tipo` é `ERRO_SINTATICO`, `linha` e `coluna` localizam o problema, `esperado` e `encontrado` são textos e `regra` aponta para uma produção da gramática. `mensagem` explica o problema em português. Se a fonte terminar antes de fechar uma expressão, `encontrado` será `EOF` e a posição indicará o fim físico do texto.

| Exemplo | Fase e diagnóstico esperado |
|---|---|
| `x = (2 + 3` | Sintática. Espera `)` e encontra `EOF` na linha 1, coluna 11. |
| `x = = 2` | Sintática. Espera o início de uma expressão e encontra `=` na linha 1, coluna 5. |
| `if x > 0` seguido de um bloco | Sintática. Espera `:` e encontra `NEWLINE` na linha 1, coluna 9. |
| `x = @ 2` | Léxica. O caractere `@` está na linha 1, coluna 5, e suspende o parser. |

Para `x = = 2`, a resposta inclui o diagnóstico abaixo e mantém os tokens do scanner em `tokens`.

```json
{
  "estado_sintatico": "invalido",
  "ast": null,
  "erros_sintaticos": [
    {
      "tipo": "ERRO_SINTATICO",
      "linha": 1,
      "coluna": 5,
      "regra": "primaria",
      "esperado": "expressao_primaria",
      "encontrado": "=",
      "mensagem": "Erro sintático na linha 1, coluna 5: Use um identificador, um número ou uma expressão entre parênteses. Encontrado: '='."
    }
  ]
}
```

O parser limita o aninhamento de parênteses e blocos a 64 níveis por categoria e a profundidade da AST a 128 níveis para manter a serialização da resposta dentro dos limites da aplicação. Os tipos `limite_aninhamento_excedido` e `limite_profundidade_ast_excedido` trazem o campo `limite` e a natureza `limite_do_subconjunto`. Assim, a API distingue o limite operacional de uma violação da sintaxe do recorte. Entradas vazias, apenas com espaços em branco ou com corpo de requisição inválido recebem HTTP 400. Entradas acima de 10.000 caracteres recebem HTTP 413. Falhas inesperadas recebem HTTP 500 com mensagem genérica. Essas respostas seguem o objeto `{"recebido":false,"erro":{"tipo":"...","mensagem":"..."}}`.

A análise verifica estrutura, sem executar o código. Resolução de nomes, tipos e tabela de símbolos pertencem à Etapa 5.
