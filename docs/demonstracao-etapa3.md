# Tutorial inicial e demonstração - Etapa 3

## Conceitos em uma frase

**Token** é uma unidade reconhecida e classificada pelo scanner; **lexema** é o texto concreto dessa unidade. Em `numero = 10`, o lexema `numero` recebe a categoria `IDENTIFICADOR`. As posições começam em linha 1, coluna 1.

## Preparação

1. Extraia a entrega e entre em `Compiladores/`.
2. Execute `docker compose up --build -d`.
3. Confira `docker compose ps` e abra `http://localhost:8080`.
4. Se os serviços não subirem, consulte os logs; não declare o ambiente validado sem executar esse fluxo.

## Roteiro de aproximadamente dois minutos

1. **Código válido:** selecione “Atribuição de variáveis”, clique em analisar e mostre `x`, `=`, `10`, `y`, `=`, `2.5`. Explique as categorias e compare as posições com o código original.
2. **Blocos:** selecione “Estrutura condicional”. Mostre as palavras `if`/`else`, o delimitador `:` e os tokens estruturais de linha/indentação. Esses tokens registram a estrutura léxica; o scanner ainda não verifica a gramática completa.
3. **Erro léxico recuperável:** escreva o programa abaixo e analise. Mostre a posição do caractere inválido e confirme que tokens posteriores continuam aparecendo.

```python
x = 10
y = @ 2
z = x + 1
```

4. **Diferença entre léxico e sintático:** selecione “Código com erro intencional”. Explique por que um operador sem operando pode ser tokenizado normalmente. A estrutura do programa será examinada pelo parser da Etapa 4.
5. **Regressão:** apague o código e clique em analisar. A validação de entrada vazia da Etapa 2 deve continuar funcionando. Carregue novamente um exemplo para demonstrar a recuperação da interface.

## Exercício para o aluno

Antes de analisar `total = (3 + 2) / 5`, preveja a sequência de tokens e as colunas dos lexemas. Compare sua previsão com a tabela. Depois substitua um número por `123abc` e observe a diferença entre um identificador válido e uma sequência inválida.

## Limites

O software não executa o programa, não calcula seu resultado e não verifica nomes ou tipos. Sucesso léxico não equivale a programa correto. Strings e demais recursos de Python fora do recorte devem ser discutidos como limitações explicitadas, sem atribuir ao scanner cobertura de Python completo.
