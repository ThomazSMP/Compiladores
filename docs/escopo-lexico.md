# Especificação do subconjunto léxico

O scanner está em `backend/app/scanner.py`. A implementação manual percorre as linhas e caracteres, usa reconhecimento de maior comprimento para operadores compostos e acumula tokens e erros. A expressão regular é usada apenas para validar o lexema numérico já coletado; não há execução de código nem dependência de gerador de compiladores. Essa escolha torna o reconhecimento e sua recuperação verificáveis por testes pequenos, mantendo as tecnologias da Etapa 2.

## Categorias

| Categoria | Regra |
|---|---|
| `PALAVRA_RESERVADA` | `if`, `else` (palavra inteira) |
| `IDENTIFICADOR` | `[A-Za-z_][A-Za-z0-9_]*` |
| `LITERAL_INTEIRO` | `0` ou `[1-9][0-9]*` |
| `LITERAL_REAL` | `[0-9]+\.[0-9]*` ou `\.[0-9]+` |
| `OPERADOR` | `+ - * / = == != <= >= < >` |
| `DELIMITADOR` | `( ) :` |
| `NEWLINE` | Fim de linha lógica; lexema é a quebra original ou `""` no fim do arquivo |
| `INDENT` | Aumento de recuo fora de parênteses; lexema contém os espaços iniciais |
| `DEDENT` | Retorno a recuo anterior ou fim do arquivo; lexema vazio |

O sinal em `-2` é um operador separado do inteiro `2`. Identificadores são limitados a ASCII, embora Python completo permita outros caracteres. `True`, `False`, `and`, `while` e demais palavras reservadas de Python fora do recorte geram erro. Um nome comum não é submetido à consulta de declaração ou tipo: isso é semântica futura.

São aceitos reais como `2.5`, `.5`, `5.` e `00.5`. Inteiros `01`, números com expoente (`1e3`), bases alternativas (`0x10`), separadores (`1_000`) e sequências como `123abc`/`1.2.3` geram erro numérico. Esse recorte é didático e mais restrito que Python completo.

## Espaços, comentários e posições

- Espaços e tabulações entre tokens são ignorados. Tabulação no início da linha gera orientação para usar espaços; recomenda-se quatro por nível, mas o scanner acompanha os níveis de recuo efetivamente encontrados.
- `#` inicia comentário até o fim da linha. Linhas vazias ou compostas apenas por comentários não geram tokens de conteúdo nem `NEWLINE`.
- Não há comentários de bloco, strings ou continuação explícita por barra invertida.
- Dentro de parênteses, quebras de linha e recuos não geram `NEWLINE`/`INDENT`/`DEDENT`. Isso não valida a correspondência sintática completa dos parênteses.
- Linha e coluna começam em 1 e contam caracteres, não largura visual. O lexema mantém o texto original. Quebras CRLF são reconhecidas.
- `DEDENT` no fim do arquivo usa a posição após o último caractere ou o começo da próxima linha, conforme exista quebra final.

## Recuperação

Cada erro tem `tipo`, `lexema`, `linha`, `coluna` e `mensagem`. Caracteres inválidos são consumidos sem encerrar a análise; números inválidos são tratados como uma sequência problemática única. Strings são consumidas até o fechamento ou fim da linha e reportadas como fora do subconjunto; se não fechadas, a mensagem também informa esse problema. Operadores conhecidos, mas fora do recorte, como `**`, `//` e `+=`, recebem mensagem específica.

O scanner continua onde for possível. Um erro de recuo pode produzir tokens úteis junto à lista de erros, mas `sucesso` será `false`; esses tokens não devem ser interpretados como uma validação do programa.

## Separação das fases

`x = 10 +`, `if x > :` e `y = = 2` possuem lexemas reconhecíveis. Eles podem apresentar sucesso léxico, mesmo sendo sintaticamente inválidos. Esta etapa não verifica gramática, precedência, declaração de nomes ou compatibilidade de tipos. O parser da Etapa 4 será responsável por examinar a sequência de tokens.
