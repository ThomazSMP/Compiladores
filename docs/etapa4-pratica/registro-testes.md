# Registro de verificação prática da Etapa 4

Execução em 24/11/2026. O Docker Desktop 29.9.1 e o Docker Compose 5.6.0 executaram o backend em Python 3.12, o Nginx e as suítes de teste em um projeto isolado. O navegador foi o Chrome 155 controlado pelo Playwright. O endereço usado nas verificações foi `http://localhost:18084`.

```bash
export COMPOSE_PROJECT_NAME=compiladores-etapa4-validacao
export PORTA_WEB=18084
export BASE_URL=http://localhost:18084
docker compose config --quiet
docker compose up --build -d --wait
bash scripts/testar.sh
bash scripts/smoke_test.sh
python3 scripts/comparar_ast_python.py
node scripts/teste_navegador_etapa4.cjs  # requer Playwright e um Chromium
```

| Verificação | Observação |
|---|---|
| Construção e execução dos serviços | Backend atingiu o estado saudável. O frontend serviu a página e encaminhou as chamadas HTTP ao backend pelo Nginx. |
| Suíte Python pelos contêineres | **166 aprovados**, incluindo os 22 casos sintáticos do plano e 25 verificações práticas adicionais. O pytest também listou 26 pulos no arquivo histórico e um aviso de depreciação do `TestClient` do Starlette/AnyIO. |
| Suíte Node pelos contêineres | **60 aprovados**, incluindo renderização, estados das fases, navegação e posições. |
| Smoke test em HTTP | **18 aprovados**. Validou HTML e JS, `GET /api/hello`, exemplos, respostas válidas, erros léxicos e sintáticos, cancelamento do parser e entradas inválidas. |
| Comparação independente | **120 programas válidos** gerados com semente `20261124` tiveram a estrutura da AST equivalente à de `ast.parse` após normalizar os nomes dos nós e atributos. O script compara o domínio comum e conserva exemplos determinísticos ao ser reexecutado. |
| Navegador | **5 cenários da Etapa 4 e 5 verificações de regressão da Etapa 3** aprovados. Executados no Chrome, incluindo tela de 390 px e entrada de 10.000 caracteres. O teste da Etapa 3 foi executado em pasta temporária para preservar as capturas históricas. |

Os seis arquivos protegidos pelo [congelamento do protocolo](../etapa4/congelamento-protocolo.json) mantiveram seus hashes. Os 22 pulos sintáticos pertencem ao scaffold histórico e correspondem a casos agora executados em `backend/tests/test_parser.py`. Os quatro pulos restantes referem-se à análise semântica da Etapa 5. CT-17 e CT-38 também foram verificados pelo endpoint.

| Entrada observada na interface | Resultado esperado e conferido |
|---|---|
| `resultado = 10 + 5 * 2` | AST com `+` acima de `*`. A seleção da multiplicação marca `5 * 2` no editor. O token `5` e o início desse nó coincidem na linha 1, coluna 18. [Captura](ast-desktop.png) |
| `resultado = (10 + 5` | Ausência de `)` detectada no fim do código (linha 1, coluna 20). A API preserva os tokens e retorna AST nula. [Captura](erro-sintatico.png) |
| `else:` seguido de `x = 1` recuado | Diagnóstico sintático na primeira linha informa que `else` precisa de um `if` correspondente. |
| `resultado = @ 2` | Erro léxico disponível no painel e análise sintática suspensa. |
| `if x > 0` com `:` e ramos recuados | AST de condicional, com a condição e os ramos de cada atribuição. A página manteve a largura da tela de 390 px. [Captura](ast-celular.png) |
| 2.500 atribuições, somando 10.000 caracteres | AST com 2.500 comandos e raiz recolhida por padrão. Acrescentar um caractere faz a interface exibir o aviso de limite. |

A revisão encontrou uma colisão entre o texto de certos identificadores e os nomes das categorias de token, como `EOF`. O parser passou a diferenciar a categoria do lexema e o caso ganhou um teste de regressão. Na primeira tentativa de execução, o Docker Desktop estava fechado. Depois de iniciá-lo, a verificação completa foi concluída nos contêineres.

O [roteiro de demonstração](demonstracao.md) reproduz o fluxo. O estudo com participantes e as medidas de aprendizagem ficam previstos no [plano acadêmico](../etapa4/protocolo-avaliacao.md).
