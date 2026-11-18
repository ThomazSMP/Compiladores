# Casos de teste definidos antes da avaliação

Versão **1.0**, definida em **18/11/2026**, sobre a base `5d9d81a`. O arquivo canônico é `casos-de-teste.json`. Os 40 casos permanecem **PENDENTES**, sem resultado observado. Os testes históricos da Etapa 3 não são apresentados como resultados do parser.

## Critérios e regras de interpretação

C1: correção léxica; C2: correção sintática; C3: estrutura da AST; C4: localização e separação de diagnósticos; C5: clareza das mensagens; C6: legibilidade e navegação; C7: correspondência entre representações; C8: proporção de casos aprovados; C9: limites e robustez; C10: reprodutibilidade; C11: documentação e uso; C12: semântica futura. Os procedimentos completos estão em `protocolo-avaliacao.md`.

A decisão proposta é não executar o parser quando houver erros léxicos. No primeiro erro sintático, o parser deverá interromper a construção, retornar AST nula e informar esperado/encontrado e posição. Não se promete recuperação sintática nem AST parcial. Comentários sem comandos poderão gerar `Programa` com corpo vazio; entrada vazia ou somente espaços é recusada antes da análise.

Os testes iniciais verificam somente a fase disponível de cada caso. A aprovação do léxico em CT-17/CT-38 não aprova suas expectativas futuras de bloqueio/AST; as expectativas completas permanecem pendentes. As verificações do esquema do plano são contadas separadamente de casos funcionais. Casos sintáticos e semânticos não executados aparecem como `skip`, nunca como aprovados.

## Inventário

| ID | Categoria / fase | Entrada ou objetivo | Resultado esperado | Situação |
|---|---|---|---|---|
| CT-01 | valido / sintatica | `x = 1` | Parser aceita e produz AST | PENDENTE |
| CT-02 | valido / sintatica | `x = 2 + 3 * 4` | Parser aceita e produz AST | PENDENTE |
| CT-03 | valido / sintatica | `x = (2 + 3) * 4` | Parser aceita e produz AST | PENDENTE |
| CT-04 | valido / sintatica | `x = -2 * 3` | Parser aceita e produz AST | PENDENTE |
| CT-05 | valido / sintatica | `x = 2 < 3` | Parser aceita e produz AST | PENDENTE |
| CT-06 | valido / sintatica | `if x > 0:\n    y = 1\n` | Parser aceita e produz AST | PENDENTE |
| CT-07 | valido / sintatica | `if x > 0:\n    y = 1\nelse:\n    y = 2\n` | Parser aceita e produz AST | PENDENTE |
| CT-08 | valido / sintatica | `if x > 0:\n    if y < 2:\n        z = 1\n    else:\n        z = 2\nelse:\n    z = 3\n` | Parser aceita e produz AST | PENDENTE |
| CT-09 | valido / sintatica | `x = 2\ny = x + 3\nif y >= 5:\n    y = y / 2\n` | Parser aceita e produz AST | PENDENTE |
| CT-10 | valido / sintatica | `a = .5\nb = 5.\nc = 00.5` | Parser aceita e produz AST | PENDENTE |
| CT-11 | valido_sintaticamente / sintatica | `y = x + 1` | Parser aceita e produz AST | PENDENTE |
| CT-12 | valido / sintatica | `x = (1 +\n    2)\n` | Parser aceita e produz AST | PENDENTE |
| CT-13 | lexico_valido / lexica | `if else ifx _x1` | Léxico aceito | PENDENTE |
| CT-14 | lexico_valido / lexica | `a<=b != c == d >= e` | Léxico aceito | PENDENTE |
| CT-15 | lexico_valido / lexica | `a = 0\nb = .5\nc = 5.\nd = 00.5` | Léxico aceito | PENDENTE |
| CT-16 | lexico_valido / lexica | `# início\nx = 10 # anotação\ny=2` | Léxico aceito | PENDENTE |
| CT-17 | erro_lexico / lexica | `x = @ 2\ny = 3` | Léxico com erro localizado; recuperação quando possível | PENDENTE |
| CT-18 | erro_lexico / lexica | `x = 123abc` | Léxico com erro localizado; recuperação quando possível | PENDENTE |
| CT-19 | erro_lexico / lexica | `x = 1.2.3` | Léxico com erro localizado; recuperação quando possível | PENDENTE |
| CT-20 | erro_lexico / lexica | `x = "texto` | Léxico com erro localizado; recuperação quando possível | PENDENTE |
| CT-21 | erro_lexico / lexica | `x = @ 2\ny = $ 3` | Léxico com erro localizado; recuperação quando possível | PENDENTE |
| CT-22 | erro_lexico / lexica | `if x:\n	y=1` | Léxico com erro localizado; recuperação quando possível | PENDENTE |
| CT-23 | erro_lexico / lexica | `if x:\n    y=1\n  z=2` | Léxico com erro localizado; recuperação quando possível | PENDENTE |
| CT-24 | erro_sintatico / sintatica | `if x > 0\n    y = 1\n` | Parser recusa; AST nula e diagnóstico | PENDENTE |
| CT-25 | erro_sintatico / sintatica | `x = (2 + 3` | Parser recusa; AST nula e diagnóstico | PENDENTE |
| CT-26 | erro_sintatico / sintatica | `x = 2 +` | Parser recusa; AST nula e diagnóstico | PENDENTE |
| CT-27 | erro_sintatico / sintatica | `else:\n    x = 1\n` | Parser recusa; AST nula e diagnóstico | PENDENTE |
| CT-28 | erro_sintatico / sintatica | `x = = 2` | Parser recusa; AST nula e diagnóstico | PENDENTE |
| CT-29 | erro_sintatico / sintatica | `if = 2` | Parser recusa; AST nula e diagnóstico | PENDENTE |
| CT-30 | erro_sintatico / sintatica | `if x > 0:\n` | Parser recusa; AST nula e diagnóstico | PENDENTE |
| CT-31 | fora_do_recorte_sintatico / sintatica | `x = 1 < 2 < 3` | Parser recusa; AST nula e diagnóstico | PENDENTE |
| CT-32 | fora_do_recorte_sintatico / sintatica | `x` | Parser recusa; AST nula e diagnóstico | PENDENTE |
| CT-33 | semantico_futuro / semantica | `y = x + 1` | Oráculo reservado para a Etapa 5; não executar agora | PENDENTE |
| CT-34 | semantico_futuro / semantica | `cond = 1\nif cond > 0:\n    x = 2\ny = x` | Oráculo reservado para a Etapa 5; não executar agora | PENDENTE |
| CT-35 | semantico_futuro / semantica | `x = 1\nx = 2\ny = x` | Oráculo reservado para a Etapa 5; não executar agora | PENDENTE |
| CT-36 | semantico_futuro / semantica | `if 1:\n    x = 2\ny = x` | Oráculo reservado para a Etapa 5; não executar agora | PENDENTE |
| CT-37 | borda / entrada | `` | HTTP 400; entrada_vazia | PENDENTE |
| CT-38 | borda / lexica | `# apenas comentário` | Léxico aceito | PENDENTE |
| CT-39 | borda / entrada | 10.001 caracteres excedem o limite de 10.000. | HTTP 413; entrada_muito_grande | PENDENTE |
| CT-40 | borda / sintatica | `x = (((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((1)))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))` | Parser recusa; AST nula e diagnóstico | PENDENTE |

## Entradas completas e oráculos

Os casos a seguir foram elaborados para este projeto; não são transcrições dos artigos. Cada identificador remete aos critérios definidos previamente. Casos que não se aplicam ao recorte, como ponto e vírgula obrigatório, funções, laços, declarações sem inicialização, comentários de bloco e checagem estática geral de tipos, não são contados como funcionalidades implementadas.

### CT-01 - Atribuição simples.

```python
x = 1
```

Critérios: C2, C3. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "x"
          },
          "valor": {
            "tipo": "Numero",
            "lexema": "1",
            "categoria": "inteiro"
          }
        }
      ]
    }
  }
}
```

### CT-02 - Multiplicação tem precedência sobre adição.

```python
x = 2 + 3 * 4
```

Critérios: C2, C3. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "x"
          },
          "valor": {
            "tipo": "Binaria",
            "operador": "+",
            "esquerda": {
              "tipo": "Numero",
              "lexema": "2",
              "categoria": "inteiro"
            },
            "direita": {
              "tipo": "Binaria",
              "operador": "*",
              "esquerda": {
                "tipo": "Numero",
                "lexema": "3",
                "categoria": "inteiro"
              },
              "direita": {
                "tipo": "Numero",
                "lexema": "4",
                "categoria": "inteiro"
              }
            }
          }
        }
      ]
    }
  }
}
```

### CT-03 - Parênteses alteram o agrupamento; não viram nós de pontuação.

```python
x = (2 + 3) * 4
```

Critérios: C2, C3. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "x"
          },
          "valor": {
            "tipo": "Binaria",
            "operador": "*",
            "esquerda": {
              "tipo": "Binaria",
              "operador": "+",
              "esquerda": {
                "tipo": "Numero",
                "lexema": "2",
                "categoria": "inteiro"
              },
              "direita": {
                "tipo": "Numero",
                "lexema": "3",
                "categoria": "inteiro"
              }
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "4",
              "categoria": "inteiro"
            }
          }
        }
      ]
    }
  }
}
```

### CT-04 - Sinal unário se associa ao operando antes da multiplicação.

```python
x = -2 * 3
```

Critérios: C2, C3. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "x"
          },
          "valor": {
            "tipo": "Binaria",
            "operador": "*",
            "esquerda": {
              "tipo": "Unaria",
              "operador": "-",
              "operando": {
                "tipo": "Numero",
                "lexema": "2",
                "categoria": "inteiro"
              }
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "3",
              "categoria": "inteiro"
            }
          }
        }
      ]
    }
  }
}
```

### CT-05 - Comparação simples como expressão; não é declaração de tipo.

```python
x = 2 < 3
```

Critérios: C2, C3. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "x"
          },
          "valor": {
            "tipo": "Comparacao",
            "operador": "<",
            "esquerda": {
              "tipo": "Numero",
              "lexema": "2",
              "categoria": "inteiro"
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "3",
              "categoria": "inteiro"
            }
          }
        }
      ]
    }
  }
}
```

### CT-06 - Condicional sem else; nome x pode ser aceito sintaticamente sem verificação semântica.

```python
if x > 0:
    y = 1

```

Critérios: C2, C3. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Se",
          "condicao": {
            "tipo": "Comparacao",
            "operador": ">",
            "esquerda": {
              "tipo": "Nome",
              "identificador": "x"
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "0",
              "categoria": "inteiro"
            }
          },
          "entao": [
            {
              "tipo": "Atribuicao",
              "alvo": {
                "tipo": "Nome",
                "identificador": "y"
              },
              "valor": {
                "tipo": "Numero",
                "lexema": "1",
                "categoria": "inteiro"
              }
            }
          ],
          "senao": []
        }
      ]
    }
  }
}
```

### CT-07 - Condicional com alternativas.

```python
if x > 0:
    y = 1
else:
    y = 2

```

Critérios: C2, C3. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Se",
          "condicao": {
            "tipo": "Comparacao",
            "operador": ">",
            "esquerda": {
              "tipo": "Nome",
              "identificador": "x"
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "0",
              "categoria": "inteiro"
            }
          },
          "entao": [
            {
              "tipo": "Atribuicao",
              "alvo": {
                "tipo": "Nome",
                "identificador": "y"
              },
              "valor": {
                "tipo": "Numero",
                "lexema": "1",
                "categoria": "inteiro"
              }
            }
          ],
          "senao": [
            {
              "tipo": "Atribuicao",
              "alvo": {
                "tipo": "Nome",
                "identificador": "y"
              },
              "valor": {
                "tipo": "Numero",
                "lexema": "2",
                "categoria": "inteiro"
              }
            }
          ]
        }
      ]
    }
  }
}
```

### CT-08 - Blocos aninhados; cada else se associa ao if do mesmo nível.

```python
if x > 0:
    if y < 2:
        z = 1
    else:
        z = 2
else:
    z = 3

```

Critérios: C2, C3, C7. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Se",
          "condicao": {
            "tipo": "Comparacao",
            "operador": ">",
            "esquerda": {
              "tipo": "Nome",
              "identificador": "x"
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "0",
              "categoria": "inteiro"
            }
          },
          "entao": [
            {
              "tipo": "Se",
              "condicao": {
                "tipo": "Comparacao",
                "operador": "<",
                "esquerda": {
                  "tipo": "Nome",
                  "identificador": "y"
                },
                "direita": {
                  "tipo": "Numero",
                  "lexema": "2",
                  "categoria": "inteiro"
                }
              },
              "entao": [
                {
                  "tipo": "Atribuicao",
                  "alvo": {
                    "tipo": "Nome",
                    "identificador": "z"
                  },
                  "valor": {
                    "tipo": "Numero",
                    "lexema": "1",
                    "categoria": "inteiro"
                  }
                }
              ],
              "senao": [
                {
                  "tipo": "Atribuicao",
                  "alvo": {
                    "tipo": "Nome",
                    "identificador": "z"
                  },
                  "valor": {
                    "tipo": "Numero",
                    "lexema": "2",
                    "categoria": "inteiro"
                  }
                }
              ]
            }
          ],
          "senao": [
            {
              "tipo": "Atribuicao",
              "alvo": {
                "tipo": "Nome",
                "identificador": "z"
              },
              "valor": {
                "tipo": "Numero",
                "lexema": "3",
                "categoria": "inteiro"
              }
            }
          ]
        }
      ]
    }
  }
}
```

### CT-09 - Múltiplas construções em sequência.

```python
x = 2
y = x + 3
if y >= 5:
    y = y / 2

```

Critérios: C2, C7. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "x"
          },
          "valor": {
            "tipo": "Numero",
            "lexema": "2",
            "categoria": "inteiro"
          }
        },
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "y"
          },
          "valor": {
            "tipo": "Binaria",
            "operador": "+",
            "esquerda": {
              "tipo": "Nome",
              "identificador": "x"
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "3",
              "categoria": "inteiro"
            }
          }
        },
        {
          "tipo": "Se",
          "condicao": {
            "tipo": "Comparacao",
            "operador": ">=",
            "esquerda": {
              "tipo": "Nome",
              "identificador": "y"
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "5",
              "categoria": "inteiro"
            }
          },
          "entao": [
            {
              "tipo": "Atribuicao",
              "alvo": {
                "tipo": "Nome",
                "identificador": "y"
              },
              "valor": {
                "tipo": "Binaria",
                "operador": "/",
                "esquerda": {
                  "tipo": "Nome",
                  "identificador": "y"
                },
                "direita": {
                  "tipo": "Numero",
                  "lexema": "2",
                  "categoria": "inteiro"
                }
              }
            }
          ],
          "senao": []
        }
      ]
    }
  }
}
```

### CT-10 - Formas reais reconhecidas pelo scanner atual.

```python
a = .5
b = 5.
c = 00.5
```

Critérios: C1, C2. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "a"
          },
          "valor": {
            "tipo": "Numero",
            "lexema": ".5",
            "categoria": "real"
          }
        },
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "b"
          },
          "valor": {
            "tipo": "Numero",
            "lexema": "5.",
            "categoria": "real"
          }
        },
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "c"
          },
          "valor": {
            "tipo": "Numero",
            "lexema": "00.5",
            "categoria": "real"
          }
        }
      ]
    }
  }
}
```

### CT-11 - Nome não vinculado não deve ser tratado como erro de sintaxe.

```python
y = x + 1
```

Critérios: C2, C5. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "y"
          },
          "valor": {
            "tipo": "Binaria",
            "operador": "+",
            "esquerda": {
              "tipo": "Nome",
              "identificador": "x"
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "1",
              "categoria": "inteiro"
            }
          }
        }
      ]
    }
  }
}
```

### CT-12 - Quebra dentro de parênteses não abre bloco.

```python
x = (1 +
    2)

```

Critérios: C1, C2. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "valido",
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": [
        {
          "tipo": "Atribuicao",
          "alvo": {
            "tipo": "Nome",
            "identificador": "x"
          },
          "valor": {
            "tipo": "Binaria",
            "operador": "+",
            "esquerda": {
              "tipo": "Numero",
              "lexema": "1",
              "categoria": "inteiro"
            },
            "direita": {
              "tipo": "Numero",
              "lexema": "2",
              "categoria": "inteiro"
            }
          }
        }
      ]
    }
  }
}
```

### CT-13 - Palavras inteiras e identificadores não confundidos.

```python
if else ifx _x1
```

Critérios: C1. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true,
    "tokens_significativos": [
      [
        "PALAVRA_RESERVADA",
        "if",
        1,
        1
      ],
      [
        "PALAVRA_RESERVADA",
        "else",
        1,
        4
      ],
      [
        "IDENTIFICADOR",
        "ifx",
        1,
        9
      ],
      [
        "IDENTIFICADOR",
        "_x1",
        1,
        13
      ]
    ]
  }
}
```

### CT-14 - Maior lexema para operadores compostos; a sequência não é oráculo sintático.

```python
a<=b != c == d >= e
```

Critérios: C1. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true,
    "operadores": [
      "<=",
      "!=",
      "==",
      ">="
    ]
  }
}
```

### CT-15 - Inteiro e reais decimais.

```python
a = 0
b = .5
c = 5.
d = 00.5
```

Critérios: C1. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true,
    "contagem_tipos": {
      "LITERAL_INTEIRO": 1,
      "LITERAL_REAL": 3
    }
  }
}
```

### CT-16 - Comentário ignorado, posição da linha seguinte preservada.

```python
# início
x = 10 # anotação
y=2
```

Critérios: C1, C7. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true,
    "primeiro_token": [
      "IDENTIFICADOR",
      "x",
      2,
      1
    ]
  }
}
```

### CT-17 - Caractere inválido, recuperação e bloqueio futuro do parser.

```python
x = @ 2
y = 3
```

Critérios: C1, C4, C5. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": false,
    "erros": [
      [
        "@",
        1,
        5
      ]
    ],
    "ultimo_token_significativo": [
      "LITERAL_INTEIRO",
      "3",
      2,
      5
    ]
  },
  "sintatico": {
    "executar": false,
    "estado": "nao_executado",
    "ast": null
  }
}
```

### CT-18 - Identificador iniciado por dígitos é uma sequência numérica inválida única.

```python
x = 123abc
```

Critérios: C1, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": false,
    "erros": [
      [
        "123abc",
        1,
        5
      ]
    ]
  }
}
```

### CT-19 - Literal numérico com dois pontos.

```python
x = 1.2.3
```

Critérios: C1, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": false,
    "erros": [
      [
        "1.2.3",
        1,
        5
      ]
    ]
  }
}
```

### CT-20 - Literal textual não fechado; strings também estão fora do recorte.

```python
x = "texto
```

Critérios: C1, C4, C5. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": false,
    "erros": [
      [
        "\"texto",
        1,
        5
      ]
    ],
    "mensagem_contem": "não fechado"
  }
}
```

### CT-21 - Mais de um erro com posições independentes.

```python
x = @ 2
y = $ 3
```

Critérios: C1, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": false,
    "erros": [
      [
        "@",
        1,
        5
      ],
      [
        "$",
        2,
        5
      ]
    ]
  }
}
```

### CT-22 - Tabulação inicial fora do subconjunto, sem falha interna.

```python
if x:
	y=1
```

Critérios: C1, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": false,
    "erros": [
      [
        "\t",
        2,
        1
      ]
    ],
    "mensagem_contem": "tabulação"
  }
}
```

### CT-23 - Retorno de recuo que não corresponde a nível anterior.

```python
if x:
    y=1
  z=2
```

Critérios: C1, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": false,
    "erros": [
      [
        "  ",
        3,
        1
      ]
    ],
    "mensagem_contem": "recuo"
  }
}
```

### CT-24 - Falta de dois-pontos após condição.

```python
if x > 0
    y = 1

```

Critérios: C2, C4, C5. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "invalido",
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "esperado": ":",
      "encontrado": "NEWLINE",
      "linha": 1,
      "coluna": 9
    }
  }
}
```

### CT-25 - Parêntese de fechamento ausente.

```python
x = (2 + 3
```

Critérios: C2, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "invalido",
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "esperado": ")",
      "encontrado": "EOF",
      "linha": 1,
      "coluna": 11
    }
  }
}
```

### CT-26 - Falta de operando; os tokens são lexicamente válidos.

```python
x = 2 +
```

Critérios: C2, C4, C5. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "invalido",
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "esperado": "expressao_primaria",
      "encontrado": "NEWLINE",
      "linha": 1,
      "coluna": 8
    }
  }
}
```

### CT-27 - Else sem condicional correspondente.

```python
else:
    x = 1

```

Critérios: C2, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "invalido",
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "esperado": "atribuicao_ou_if",
      "encontrado": "else",
      "linha": 1,
      "coluna": 1
    }
  }
}
```

### CT-28 - Operador de atribuição onde se espera operando.

```python
x = = 2
```

Critérios: C2, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "invalido",
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "esperado": "expressao_primaria",
      "encontrado": "=",
      "linha": 1,
      "coluna": 5
    }
  }
}
```

### CT-29 - Palavra reservada não serve de alvo de atribuição.

```python
if = 2
```

Critérios: C2, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "invalido",
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "esperado": "expressao_primaria",
      "encontrado": "=",
      "linha": 1,
      "coluna": 4
    }
  }
}
```

### CT-30 - Fim antes do bloco obrigatório.

```python
if x > 0:

```

Critérios: C2, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "invalido",
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "esperado": "INDENT",
      "encontrado": "EOF",
      "linha": 2,
      "coluna": 1
    }
  }
}
```

### CT-31 - Comparação encadeada é válida em Python completo, mas excluída desta gramática.

```python
x = 1 < 2 < 3
```

Critérios: C2, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "invalido",
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "esperado": "NEWLINE",
      "encontrado": "<",
      "linha": 1,
      "coluna": 11
    }
  }
}
```

### CT-32 - Expressão isolada é válida em Python completo; o recorte exige atribuição ou if.

```python
x
```

Critérios: C2, C4. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "estado": "invalido",
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "esperado": "=",
      "encontrado": "NEWLINE",
      "linha": 1,
      "coluna": 2
    }
  }
}
```

### CT-33 - Uso de nome sem vinculação anterior no módulo do recorte. Não é erro sintático.

```python
y = x + 1
```

Critérios: C12. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "sucesso": true
  },
  "semantico_futuro": {
    "diagnostico": "nome_nao_vinculado",
    "identificador": "x",
    "linha": 1,
    "coluna": 5
  },
  "estado_implementacao": "ETAPA_5_NAO_IMPLEMENTADA"
}
```

### CT-34 - Análise conservadora de vinculação, sem execução do programa: x só é atribuído em um ramo.

```python
cond = 1
if cond > 0:
    x = 2
y = x
```

Critérios: C12. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "semantico_futuro": {
    "diagnostico": "possivel_uso_antes_de_atribuicao",
    "identificador": "x",
    "natureza": "aviso_estatico_conservador"
  },
  "observacao": "Não afirmar NameError inevitável; o ramo pode ser executado. Não há execução nem propagação de constantes prevista.",
  "estado_implementacao": "ETAPA_5_NAO_IMPLEMENTADA"
}
```

### CT-35 - Reatribuição não é redeclaração proibida em Python.

```python
x = 1
x = 2
y = x
```

Critérios: C12. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "semantico_futuro": {
    "diagnostico_de_redeclaracao": false,
    "nome_x_disponivel": true
  },
  "estado_implementacao": "ETAPA_5_NAO_IMPLEMENTADA"
}
```

### CT-36 - If não introduz escopo próprio de nomes em Python.

```python
if 1:
    x = 2
y = x
```

Critérios: C12. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "semantico_futuro": {
    "erro_de_escopo_if": false,
    "observacao": "Um eventual aviso conservador de atribuição condicional não deve ser chamado de uso fora de escopo."
  },
  "estado_implementacao": "ETAPA_5_NAO_IMPLEMENTADA"
}
```

### CT-37 - Entrada vazia recusada antes do scanner.

```python

```

Critérios: C4, C9. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "validacao": {
    "aceita": false,
    "http": 400,
    "tipo": "entrada_vazia"
  },
  "sintatico": {
    "executar": false
  }
}
```

### CT-38 - Fonte sem comandos, mas não vazia: scanner retorna lista vazia.

```python
# apenas comentário
```

Critérios: C1, C2. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true,
    "quantidade_tokens": 0
  },
  "sintatico_futuro": {
    "sucesso": true,
    "ast": {
      "tipo": "Programa",
      "corpo": []
    }
  }
}
```

### CT-39 - 10.001 caracteres excedem o limite de 10.000.

Entrada gerada: `"x" * 10001`.

Critérios: C9. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "validacao": {
    "aceita": false,
    "http": 413,
    "tipo": "entrada_muito_grande"
  },
  "sintatico": {
    "executar": false
  }
}
```

### CT-40 - Limite proposto de 64 níveis de parênteses/blocos excedido; não significa Python inválido.

```python
x = (((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((1)))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))
```

Critérios: C2, C9. Origem: elaboração para o projeto. Estado inicial: **PENDENTE**.

```json
{
  "lexico": {
    "sucesso": true
  },
  "sintatico": {
    "executar": true,
    "sucesso": false,
    "ast": null,
    "diagnostico": {
      "tipo": "limite_aninhamento_excedido",
      "natureza": "limite_do_subconjunto",
      "limite": 64
    }
  }
}
```

## Convenção da AST de referência

Os oráculos de CT-01 a CT-08, CT-11 e CT-12 são esqueletos estruturais. Identificadores numéricos artificiais, ordem de campos e posições não participam dessa comparação. A implementação prevista deverá acrescentar posição de origem a cada nó; C4 e C7 verificam essas posições separadamente. `Numero` preserva o lexema para não perder formas como `5.`. Parênteses e pontuação não viram nós, mas determinam o agrupamento.

A estrutura usa `Programa.corpo`, `Atribuicao.alvo/valor`, `Nome.identificador`, `Numero.lexema/categoria`, `Binaria.operador/esquerda/direita`, `Unaria.operador/operando`, `Comparacao.operador/esquerda/direita` e `Se.condicao/entao/senao`. Não se apresenta uma árvore de derivação como AST.

## Registro posterior e controle de mudanças

Na execução, registrar em arquivo separado: versão/hash do plano, caso, entrada, esperado, observado, aprovado/reprovado/pendente, defeito e correção. Não sobrescrever este arquivo canônico para transformar expectativas em resultados. Mudança de escopo, mensagem, limite ou oráculo exige versão nova, justificativa, data e identificação dos casos afetados antes da reexecução.
