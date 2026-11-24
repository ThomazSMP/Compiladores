# Software Educacional de Análise de Código

Software educacional web que apresenta os **tokens, a árvore sintática abstrata (AST) e os diagnósticos** de um subconjunto de Python.

**Etapa 4 prática.** A análise usa o scanner da Etapa 3 e um parser descendente recursivo. Na interface, o estudante expande a árvore, seleciona nós para localizar trechos na fonte e compara a estrutura com a tabela de tokens. Análise semântica e tabela de símbolos são previstas para a Etapa 5.

- [Gramática EBNF e exemplos](docs/etapa4-pratica/gramatica.md)
- [Estratégia do parser, tipos de nó e contrato da API](docs/etapa4-pratica/parser-e-ast.md)
- [Fluxograma da implementação](docs/etapa4-pratica/fluxograma.md)
- [Roteiro de demonstração](docs/etapa4-pratica/demonstracao.md)
- [Registro das verificações](docs/etapa4-pratica/registro-testes.md)

### Materiais e Métodos

A [Etapa 4 acadêmica, de 18/11/2026](docs/etapa4/trabalho-etapa4.md), registra a proposta anterior à implementação, com matriz de nove estudos, gramática, contrato previsto, arquitetura e fluxograma. As [notas da implementação](docs/etapa4-pratica/metodo.md) complementam o texto com os recursos desta entrega.

- [Protocolo predefinido](docs/etapa4/protocolo-avaliacao.md), [casos e oráculos](docs/etapa4/casos-de-teste.md) e [dados canônicos](docs/etapa4/casos-de-teste.json).
- [Formulário para futura avaliação por pares](docs/etapa4/formulario-pares.md) e [verificação anterior ao parser](docs/etapa4/registro-verificacao.md).

O [congelamento do protocolo](docs/etapa4/congelamento-protocolo.json) identifica por hash as definições anteriores aos testes. O serviço Docker `backend-tests` monta `docs` para ler os casos canônicos. Os resultados ficam em um registro separado. Os artigos completos acompanham o PDF acadêmico. As referências e seus links oficiais estão no texto da proposta.

## 1. Objetivo

Ajudar estudantes de graduação a compreender como um compilador processa um programa. O usuário escreve (ou escolhe) um código, solicita a análise e vê o resultado em uma interface web.

## 2. Linguagem escolhida

**Linguagem analisada: Python (subconjunto).**

- Sintaxe enxuta e legível, o que facilita explicar os resultados para quem está aprendendo.
- A indentação como delimitador de bloco é um bom caso de estudo para a análise léxica (tokens `INDENT`/`DEDENT`).
- O backend em Python permite implementar e testar scanner e parser sem acrescentar dependências específicas de análise. A linguagem analisada e a linguagem de implementação são decisões diferentes.

**Construções aceitas pelo parser**

| Construção | Exemplo |
|---|---|
| Atribuição a um nome | `x = 10` |
| Literais inteiros e de ponto flutuante | `3`, `2.5` |
| Operadores aritméticos | `+  -  *  /` e parênteses |
| Operadores relacionais | `==  !=  <  >  <=  >=` |
| Condicional com blocos não vazios e ramo alternativo opcional | `if / else` |

O escopo sintático detalha construções aceitas, precedência, limites e correspondência entre gramática e scanner. [Gramática formal](docs/etapa4-pratica/gramatica.md)

### Subconjunto léxico implementado

| Categoria | Regra / exemplos | Tratamento |
|---|---|---|
| Palavras reservadas | `if`, `else` | Categoria `PALAVRA_RESERVADA`; reconhecidas como palavras completas |
| Identificadores | `[A-Za-z_][A-Za-z0-9_]*`, como `numero`, `_x1` | Letras ASCII e sublinhado; nomes iniciados por dígito não são aceitos |
| Inteiros | `0` ou `[1-9][0-9]*`, como `0`, `10`, `42` | Categoria `LITERAL_INTEIRO`; zeros iniciais como `01` são recusados neste recorte |
| Reais | `[0-9]+\.[0-9]*` ou `\.[0-9]+`, como `2.5`, `5.`, `.5` | Categoria `LITERAL_REAL`; expoentes e separadores não são suportados |
| Operadores aritméticos | `+`, `-`, `*`, `/` | Operadores; sinal negativo é separado do número |
| Atribuição e comparação | `=`, `==`, `!=`, `<`, `>`, `<=`, `>=` | Operadores compostos reconhecidos antes dos simples |
| Delimitadores | `(`, `)`, `:` | Categoria `DELIMITADOR` |
| Comentários | `#` até o fim da linha | Ignorados; comentário de bloco não integra o subconjunto |
| Espaços | Espaços e tabs entre tokens | Ignorados, preservando a posição dos próximos tokens; tabs no início da linha geram erro didático |
| Estrutura de linhas/blocos | Quebras de linha e mudança de indentação | Tokens `NEWLINE`, `INDENT` e `DEDENT`; não equivalem à validação da gramática |
| Caracteres/sequências fora do recorte | Por exemplo, `@`, `$`, `123abc`, `1.2.3` e strings | Erros didáticos com linha e coluna; processamento continua quando possível |

As posições começam em **1**. São posições no texto, não coordenadas de pixels. O scanner representa o percurso de caracteres; não verifica precedência, declarações de variáveis, tipos ou formato de uma instrução.

## 3. Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | HTML, CSS e JavaScript puro (sem framework), servidos pelo Nginx |
| Backend | Python 3.12, FastAPI e Uvicorn |
| Orquestração | Docker e Docker Compose |
| Testes do backend | pytest (+ httpx/TestClient) e `unittest` |
| Testes do frontend | Executor nativo do Node.js (`node --test`), sem dependências externas |

## 4. Estrutura do projeto

```
Compiladores/
├── backend/
│   ├── app/
│   │   ├── main.py          # rotas, contrato HTTP e tratamento de erros
│   │   ├── scanner.py       # tokenização e erros léxicos recuperáveis
│   │   ├── parser.py        # gramática, AST e diagnóstico sintático
│   │   ├── validacao.py     # regras de validação da entrada (sem dependências)
│   │   └── exemplos.py      # programas de exemplo
│   ├── tests/               # testes unitários e de endpoints
│   ├── Dockerfile           # estágios: base, test e runtime
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/
│   ├── index.html           # tela principal
│   ├── style.css
│   ├── js/
│   │   ├── logica.js        # validação, montagem da requisição e leitura da resposta
│   │   ├── controlador.js   # fluxo da tela (exemplos, envio, mensagens)
│   │   ├── resultados.js    # apresentação de tokens e diagnósticos
│   │   ├── ast.js           # árvore navegável e posições na fonte
│   │   └── app.js           # ligação com o DOM
│   ├── tests/               # testes da lógica, do controlador e da interface
│   ├── nginx.conf           # servidor estático + proxy de /api/* para o backend
│   └── Dockerfile
├── scripts/
│   ├── testar.sh            # roda os testes do backend e do frontend no Docker
│   └── smoke_test.sh        # teste de implantação e integração (aplicação no ar)
├── docs/                   # escopo, testes, proposta e documentação da Etapa 4
├── docker-compose.yml
└── README.md
```

## 5. Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) 24 ou superior
- Docker Compose v2 (já incluso no Docker Desktop; comando `docker compose`)
- Git

```bash
docker --version
docker compose version
```

## 6. Como executar

```bash
# Extraia o ZIP desta entrega e entre na pasta do projeto:
cd Compiladores
docker compose up --build
```

Acesse a interface em **http://localhost:8080**.

Para rodar em segundo plano: `docker compose up --build -d`.

## 7. Como encerrar

```bash
docker compose down
```

Para remover também as imagens construídas: `docker compose down --rmi local`.

## 8. Como usar a interface

A tela tem duas áreas:

1. **Código-fonte** (esquerda)
   - **Carregar um exemplo:** a lista de exemplos fica no topo. Ao escolher um, o código **substitui** o conteúdo da área de edição e pode ser modificado antes da análise. Para restaurar um exemplo, escolha-o de novo.
   - **Área de edição:** campo de texto em fonte monoespaçada. Já abre com um código inicial (`x = 10`) que pode ser apagado ou substituído. O conteúdo é preservado depois de cada análise.
   - **Analisar código:** envia o código ao backend (atalho: `Ctrl + Enter`, ou `⌘ + Enter` no Mac).
2. **Resultados** (direita) — apresenta resumo, tokens com posições, erros léxicos e o resultado da análise sintática. Se a sintaxe for aceita, a seção **Árvore sintática abstrata (AST)** permite expandir ou recolher ramos e selecionar um nó para localizar seu trecho no editor. Se o parser encontrar um problema, a interface mostra o primeiro diagnóstico com sua localização.

Para `x = 10 +`, a tabela inclui todos os tokens reconhecidos. Na seção sintática, o diagnóstico indica a falta de um operando após `+`. Para `x = @ 2`, a interface mostra o erro léxico e informa que o parser não foi executado. [Demonstração guiada](docs/etapa4-pratica/demonstracao.md)

### Exemplos disponíveis

| Exemplo | Código | O que pretende demonstrar |
|---|---|---|
| Atribuição de variáveis | `x = 10`<br>`y = 2.5` | Identificadores, operador `=` e literais inteiros e de ponto flutuante |
| Operações aritméticas | `a = 10`<br>`b = 5`<br>`resultado = (a + b) * 2 - 3 / 1` | Operadores `+ - * /`, parênteses e precedência |
| Estrutura condicional | `numero = 10`<br>`if numero > 0:`<br>`    numero = numero + 1`<br>`else:`<br>`    numero = 0` | `if/else`, operador relacional, `:` e blocos por indentação (`INDENT`/`DEDENT`) |
| Código com erro intencional | `x = 10 +`<br>`if x > :`<br>`    y = = 2` | O scanner reconhece os tokens e o parser apresenta o primeiro erro sintático |
| Erros léxicos com recuperação | `x = 10 @`<br>`y = 12abc`<br>`resultado = x + 2 $` | O scanner registra os erros e os demais tokens reconhecidos |

Os exemplos ficam no backend (`backend/app/exemplos.py`) e são entregues pelo endpoint `GET /api/exemplos`.

## 9. Comunicação frontend ↔ backend

O navegador só conversa com o Nginx (porta 8080). O Nginx repassa tudo que começa com `/api/` ao serviço `backend` (porta 8000, acessível apenas dentro da rede do Compose). Assim o frontend usa caminhos relativos (`/api/...`) e não depende de endereços que só funcionem na máquina de desenvolvimento.

### `POST /api/analisar`

Requisição:

```json
{ "codigo": "x = 10" }
```

Para requisições processadas com HTTP 200, os campos `recebido`, `mensagem`, `resumo`, `sucesso`, `tokens` e `erros` preservam o contrato anterior. `sucesso` e `erros` descrevem a fase léxica. Os campos novos descrevem a fase sintática.

| `estado_sintatico` | Quando | `ast` | `erros_sintaticos` |
|---|---|---|---|
| `valido` | Sintaxe aceita | Objeto `Programa` | `[]` |
| `invalido` | Sintaxe recusada ou limite da análise atingido | `null` | Primeiro diagnóstico |
| `nao_executado` | Pelo menos um erro léxico | `null` | `[]` |

As posições são numeradas a partir de 1. Os nós da AST têm posição inicial e final exclusiva. O parser recebe os mesmos tokens da resposta e acrescenta apenas um marcador interno de fim de entrada. [Contrato completo e exemplos de JSON](docs/etapa4-pratica/parser-e-ast.md)

Respostas de erro (mesmo formato para todos):

```json
{
  "recebido": false,
  "erro": { "tipo": "entrada_vazia", "mensagem": "Informe um código-fonte antes de solicitar a análise." }
}
```

| HTTP | `erro.tipo` | Quando acontece |
|---|---|---|
| 400 | `entrada_vazia` | `codigo` vazio ou só com espaços, tabs e quebras de linha |
| 400 | `requisicao_invalida` | Corpo ausente, JSON malformado, `codigo` ausente ou que não seja texto |
| 413 | `entrada_muito_grande` | Mais de 10.000 caracteres |
| 500 | `erro_interno` | Falha inesperada (mensagem genérica; detalhes só no log do servidor) |

### `GET /api/exemplos`

```json
{ "exemplos": [ { "id": "atribuicao", "titulo": "...", "descricao": "...", "codigo": "..." } ] }
```

### `GET /api/hello`

Endpoint da etapa 1, mantido: `{"message": "Hello, World!"}` (também usado pelo healthcheck do Compose).

A documentação interativa do FastAPI fica em **http://localhost:8080/api/docs**.

## 10. Validações e mensagens

| Situação | Onde é tratada | Mensagem exibida |
|---|---|---|
| Entrada vazia ou só com espaços | Frontend (antes de enviar) **e** backend | "Informe um código-fonte antes de solicitar a análise." |
| Requisição inválida | Backend | Mensagem do backend (formato esperado do JSON) |
| Falha de comunicação (rede, backend fora do ar, resposta ilegível) | Frontend | "Não foi possível comunicar com o servidor. Verifique a conexão e tente novamente." |
| Erro inesperado | Backend | "Ocorreu um erro inesperado ao processar o código. Tente novamente em instantes." |

O backend valida a entrada independentemente do frontend. Nenhuma mensagem expõe caminhos internos, rastreamentos de exceção ou variáveis de ambiente.

A mensagem `Código recebido com sucesso.` confirma o recebimento. Consulte `sucesso` e `erros` para o léxico, e `estado_sintatico` e `erros_sintaticos` para a sintaxe. O diagnóstico sintático informa posição, regra, elemento esperado e elemento encontrado.

## 11. Testes automatizados

| Tipo | Onde | Ferramenta |
|---|---|---|
| Unitários (scanner, parser, validação e exemplos) | `backend/tests/` | pytest / unittest |
| Endpoints e contrato HTTP | `backend/tests/test_api.py` e `backend/tests/test_api_sintaxe.py` | pytest + TestClient |
| Unitários e de interface (lógica, controlador, HTML/CSS) | `frontend/tests/` | `node --test` |
| Implantação e integração (Nginx → backend via HTTP) | `scripts/smoke_test.sh` | bash + curl |
| Navegador (tokens, AST, seleção, erros e tela de 390 px) | `scripts/teste_navegador_etapa4.cjs` | Playwright + Chromium |
| Comparação estrutural com a AST do Python | `scripts/comparar_ast_python.py` | `ast.parse` + cliente HTTP da biblioteca padrão |
| Regressão | Todos os anteriores, reexecutados a cada alteração (inclui `GET /api/hello` da etapa 1) | — |

**Rodar os testes de backend e frontend (dentro do Docker, sem precisar da aplicação no ar):**

```bash
bash scripts/testar.sh
```

Ou separadamente:

```bash
docker compose --profile test build backend-tests
docker compose --profile test run --rm backend-tests      # pytest
docker compose --profile test run --rm frontend-tests     # node --test
```

**Rodar o teste de implantação/integração (com a aplicação no ar):**

```bash
docker compose up --build -d
bash scripts/smoke_test.sh
docker compose down
```

O [registro da Etapa 4](docs/etapa4-pratica/registro-testes.md) descreve as execuções e pendências atuais. Os históricos das etapas anteriores continuam disponíveis. [Etapa 2](docs/testes.md) · [Etapa 3](docs/testes-etapa3.md)

Para rodar fora do Docker, a partir da raiz do projeto:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
python -m pytest -q
cd ../frontend
node --test 'tests/*.test.js'
```

## 12. Validação de instalação limpa

Extraia o pacote em uma pasta nova. Entre em `Compiladores` e use um nome Compose exclusivo para o ensaio. O exemplo usa a porta 8083.

```bash
export COMPOSE_PROJECT_NAME=compiladores-validacao-etapa4
export PORTA_WEB=8083
docker compose config --quiet
docker compose build --no-cache
docker compose up -d
docker compose ps
bash scripts/testar.sh
BASE_URL=http://localhost:8083 bash scripts/smoke_test.sh
```

Abra `http://localhost:8083` e execute os exemplos válidos e inválidos do [roteiro](docs/etapa4-pratica/demonstracao.md). Ao terminar, execute `docker compose down` e encerre o terminal usado para o ensaio.

## 13. Solução de problemas

- **Porta 8080 ocupada:** execute `PORTA_WEB=8083 docker compose up --build -d` e acesse `http://localhost:8083`. Para o smoke test: `BASE_URL=http://localhost:8083 bash scripts/smoke_test.sh`. O nome padrão do projeto Compose continua sendo `compiladores-etapa3`. Para rodar duas cópias em paralelo, use nomes de projeto e portas diferentes.
- **Interface mostra "Não foi possível comunicar com o servidor":** veja os logs com `docker compose logs backend` e confirme que `docker compose ps` mostra o backend como `healthy`.
- **Lista de exemplos indisponível:** é o mesmo problema de comunicação com o backend. A área de código continua utilizável.

## 14. Limitações conhecidas

- A gramática cobre um subconjunto de Python. Funções, laços, strings, operadores lógicos e comparações encadeadas ficam fora dele.
- A análise sintática apresenta o primeiro diagnóstico por execução.
- A aplicação limita a entrada a 10.000 caracteres e controla a profundidade de aninhamento e da AST. [Limites e diagnósticos](docs/etapa4-pratica/parser-e-ast.md)
- A árvore permite explorar a estrutura já reconhecida. A execução do programa e a animação da construção da árvore estão fora desta etapa.

## 15. Próxima etapa

A Etapa 5 partirá da AST para tratar análise semântica e tabela de símbolos. A proposta acadêmica mantém prevista a avaliação por pares. [Método de avaliação](docs/etapa4/protocolo-avaliacao.md)

## 16. Entrega

O pacote da Etapa 4 inclui a aplicação, os testes e esta documentação. O [repositório oficial](https://github.com/ThomazSMP/Compiladores) conserva o histórico das etapas.
