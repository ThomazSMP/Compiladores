# Gramática do subconjunto de Python

O símbolo inicial é `programa`. A gramática apresenta as regras implementadas no parser descendente recursivo. Ela preserva as produções do [plano definido antes da implementação](../etapa4/gramatica.ebnf).

## EBNF

Em cada produção, `=` define a regra e `;` encerra sua descrição. A vírgula une elementos em sequência, `|` indica alternativas, `[ ]` indica um trecho opcional e `{ }` indica zero ou mais repetições. Os parênteses da notação agrupam alternativas. Textos entre aspas representam lexemas literais.

```ebnf
programa      = { comando }, EOF ;
comando       = atribuicao, NEWLINE | condicional ;
atribuicao    = IDENTIFICADOR, "=", expressao ;
condicional   = "if", expressao, ":", NEWLINE, INDENT, bloco, DEDENT,
                [ "else", ":", NEWLINE, INDENT, bloco, DEDENT ] ;
bloco         = comando, { comando } ;
expressao     = soma, [ comparador, soma ] ;
comparador    = "==" | "!=" | "<" | "<=" | ">" | ">=" ;
soma          = produto, { ("+" | "-"), produto } ;
produto       = unaria, { ("*" | "/"), unaria } ;
unaria        = ("+" | "-"), unaria | primaria ;
primaria      = IDENTIFICADOR | LITERAL_INTEIRO | LITERAL_REAL
                | "(", expressao, ")" ;
```

Os nomes à esquerda das produções são os não terminais. Os terminais são as categorias em maiúsculas e os lexemas entre aspas. O parser usa o tipo e, quando exigido pela produção, o lexema.

| Terminal na regra | Categoria ou origem | Exemplo |
|---|---|---|
| `IDENTIFICADOR` | `IDENTIFICADOR` | `resultado`, `_x1` |
| `LITERAL_INTEIRO` | `LITERAL_INTEIRO` | `0`, `42` |
| `LITERAL_REAL` | `LITERAL_REAL` | `2.5`, `.5`, `5.` |
| `"if"`, `"else"` | `PALAVRA_RESERVADA` | Palavras completas |
| `"="`, `"+"`, `"-"`, `"*"`, `"/"` e os comparadores | `OPERADOR` | `=`, `+`, `<=` |
| `"("`, `")"`, `":"` | `DELIMITADOR` | `:` na abertura de um ramo |
| `NEWLINE`, `INDENT`, `DEDENT` | Categorias homônimas do scanner | Fim de comando simples, entrada e saída de bloco |
| `EOF` | Marcador interno do parser | Posição imediatamente após o código |

O scanner ignora linhas vazias e comentários iniciados por `#`. Quebras dentro de parênteses não delimitam uma instrução. O último comando simples recebe `NEWLINE` mesmo quando o texto termina sem uma quebra física. A indentação dos blocos usa espaços. As linhas de um mesmo bloco devem ter o mesmo recuo. O `EOF` não é acrescentado à tabela pública de tokens.

## Precedência e associatividade

| Da maior precedência para a menor | Regra de agrupamento |
|---|---|
| Expressões entre parênteses | O conteúdo agrupado é reconhecido como uma expressão completa |
| `+` e `-` unários | À direita. Em `--2`, o primeiro sinal envolve a expressão `-2` |
| `*` e `/` | À esquerda. `24 / 4 / 2` agrupa como `(24 / 4) / 2` |
| `+` e `-` binários | À esquerda. `20 - 5 - 3` agrupa como `(20 - 5) - 3` |
| `==`, `!=`, `<`, `<=`, `>`, `>=` | No máximo uma comparação por aplicação da produção `expressao` |

`=` delimita a atribuição. Os parênteses influenciam a estrutura reconhecida e não criam um tipo de nó próprio na AST. Uma condição de `if` usa a regra geral de expressão e pode ser um número, como em `if 1:`.

## Exemplos e limites

```python
total = 10 + 5 * 2
diferenca = 20 - 5 - 3
produto = (10 + 5) * 2
if total >= 20:
    if diferenca > 0:
        total = -total
    else:
        total = 0
else:
    total = .5
```

| Código | Motivo da recusa |
|---|---|
| `x = 10 +` | A soma exige um operando depois de `+`. |
| `x = (10 + 5` | A expressão agrupada precisa de `)`. |
| `x = = 2` | O segundo `=` está na posição do início da expressão. |
| `if x > 0` | O cabeçalho exige `:`. |
| `else:` | `else` precisa pertencer a um `if` no nível de indentação correspondente. |
| `x = 1 < 2 < 3` | A expressão não admite comparações encadeadas. |
| `x = @ 2` | O scanner sinaliza `@` e a análise sintática fica suspensa. |

O recorte aceita atribuições a nomes, literais inteiros e reais, sinais unários, aritmética, comparações e condicionais `if/else` com blocos aninhados. Funções, chamadas, retornos, laços, classes, listas, strings, importações, operadores lógicos, `elif`, comandos de expressão e várias instruções na mesma linha ficam fora do recorte. A descrição dos caracteres e das categorias reconhecidos antes do parser está no [escopo léxico](../escopo-lexico.md).

A aplicação aceita até 10.000 caracteres por entrada. O parser aceita até 64 níveis de blocos e até 64 níveis de parênteses. O limite de profundidade da AST é 128 níveis. Esses limites pertencem à aplicação. Uma entrada que contém apenas comentários gera um programa com corpo vazio, enquanto o validador rejeita um campo vazio ou composto somente por espaços em branco.
