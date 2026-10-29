# Software Educacional de Análise de Código

Software educacional web para demonstrar as fases de **análise léxica, sintática e semântica** de uma linguagem de programação.

> **Status da Etapa 3:** scanner do subconjunto de Python integrado ao backend e à interface. Os tokens e erros léxicos são apresentados com posição. A interface, os exemplos, a validação de entrada e a comunicação da Etapa 2 foram preservados.
> **Ainda não implementado:** parser (Etapa 4) e análise semântica (Etapa 5). Sucesso léxico não significa que o programa seja sintaticamente correto. O código recebido não é executado.

## 1. Objetivo

Ajudar estudantes de graduação a compreender como um compilador processa um programa. O usuário escreve (ou escolhe) um código, solicita a análise e vê o resultado em uma interface web.

## 2. Linguagem escolhida

**Linguagem analisada: Python (subconjunto).**

- Sintaxe enxuta e legível, o que facilita explicar os resultados para quem está aprendendo.
- A indentação como delimitador de bloco é um bom caso de estudo para a análise léxica (tokens `INDENT`/`DEDENT`).
- O backend em Python permite implementar e testar o scanner sem acrescentar dependências. A linguagem analisada e a linguagem de implementação são decisões diferentes.

**Subconjunto previsto:**

| Construção | Exemplo |
|---|---|
| Atribuição / declaração implícita de variáveis | `x = 10` |
| Literais inteiros e de ponto flutuante | `3`, `2.5` |
| Operadores aritméticos | `+  -  *  /` e parênteses |
| Operadores relacionais | `==  !=  <  >  <=  >=` |
| Estrutura condicional | `if / else` |

Ficam **fora** do escopo inicial: funções, classes, laços, listas, strings, importações etc.

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
│   │   └── app.js           # ligação com o DOM
│   ├── tests/               # testes da lógica, do controlador e da interface
│   ├── nginx.conf           # servidor estático + proxy de /api/* para o backend
│   └── Dockerfile
├── scripts/
│   ├── testar.sh            # roda os testes do backend e do frontend no Docker
│   └── smoke_test.sh        # teste de implantação e integração (aplicação no ar)
├── docs/                   # escopo léxico, testes e roteiro de demonstração
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
2. **Resultados** (direita): apresenta o resumo da entrada, os tokens identificados (categoria, lexema, linha e coluna) e os erros léxicos. As mensagens de entrada inválida e falha de comunicação continuam disponíveis.

O sistema **não presume que o código é válido**: `x = 10 +`, por exemplo, possui tokens reconhecíveis e deve ser tokenizado sem exigir um operando. Detectar essa estrutura incompleta é responsabilidade do parser da Etapa 4.

### Exemplos disponíveis

| Exemplo | Código | O que pretende demonstrar |
|---|---|---|
| Atribuição de variáveis | `x = 10`<br>`y = 2.5` | Identificadores, operador `=` e literais inteiros e de ponto flutuante |
| Operações aritméticas | `a = 10`<br>`b = 5`<br>`resultado = (a + b) * 2 - 3 / 1` | Operadores `+ - * /`, parênteses e precedência |
| Estrutura condicional | `numero = 10`<br>`if numero > 0:`<br>`    numero = numero + 1`<br>`else:`<br>`    numero = 0` | `if/else`, operador relacional, `:` e blocos por indentação (`INDENT`/`DEDENT`) |
| Código com erro intencional | `x = 10 +`<br>`if x > :`<br>`    y = = 2` | Erros sintáticos: o scanner reconhece os tokens e não deve se passar por parser |

Os exemplos ficam no backend (`backend/app/exemplos.py`) e são entregues pelo endpoint `GET /api/exemplos`.

## 9. Comunicação frontend ↔ backend

O navegador só conversa com o Nginx (porta 8080). O Nginx repassa tudo que começa com `/api/` ao serviço `backend` (porta 8000, acessível apenas dentro da rede do Compose). Assim o frontend usa caminhos relativos (`/api/...`) e não depende de endereços que só funcionem na máquina de desenvolvimento.

### `POST /api/analisar`

Requisição:

```json
{ "codigo": "x = 10" }
```

Resposta de análise (`200`): mantém os campos da Etapa 2 e acrescenta `sucesso`, `tokens` e `erros`. Exemplo para `x = 10`, sem quebra de linha final:

```json
{
  "recebido": true,
  "mensagem": "Código recebido com sucesso.",
  "resumo": { "linhas": 1, "caracteres": 6 },
  "sucesso": true,
  "tokens": [
    { "tipo": "IDENTIFICADOR", "lexema": "x", "linha": 1, "coluna": 1 },
    { "tipo": "OPERADOR", "lexema": "=", "linha": 1, "coluna": 3 },
    { "tipo": "LITERAL_INTEIRO", "lexema": "10", "linha": 1, "coluna": 5 },
    { "tipo": "NEWLINE", "lexema": "", "linha": 1, "coluna": 7 }
  ],
  "erros": []
}
```

Erros léxicos também retornam HTTP `200`: a requisição foi processada, mas `sucesso` é `false`. O campo `recebido` permanece `true`, pois o backend recebeu uma entrada analisável. A lista `tokens` pode conter os tokens válidos encontrados antes e depois do erro.

```json
{
  "tipo": "ERRO_LEXICO",
  "lexema": "@",
  "linha": 1,
  "coluna": 5,
  "mensagem": "Caractere não reconhecido: '@'."
}
```

Esse é o formato de um item de `erros`; a redação completa inclui orientação sobre o subconjunto. Tokens são unidades classificadas; **lexema** é o trecho literal do código associado à unidade.

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

A mensagem histórica `Código recebido com sucesso.` confirma somente o recebimento. A situação léxica deve ser lida no campo `sucesso` e na lista `erros`; a interface apresenta esses resultados separadamente.

## 11. Testes automatizados

| Tipo | Onde | Ferramenta |
|---|---|---|
| Unitários (scanner, validação, exemplos) | `backend/tests/` | pytest / unittest |
| Endpoints e contrato HTTP | `backend/tests/test_api.py` | pytest + TestClient |
| Unitários e de interface (lógica, controlador, HTML/CSS) | `frontend/tests/` | `node --test` |
| Implantação e integração (Nginx → backend, ponta a ponta via HTTP) | `scripts/smoke_test.sh` | bash + curl |
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

Os resultados anteriores permanecem em [`docs/testes.md`](docs/testes.md). O registro da implementação atual fica em [`docs/testes-etapa3.md`](docs/testes-etapa3.md). Só considere validado o procedimento que tenha uma execução registrada; configuração de Docker não comprova, sozinha, que os contêineres tenham subido.

Para rodar fora do Docker:

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

Roteiro para simular uma máquina que nunca viu o projeto:

```bash
# 1. Extrair esta entrega em uma pasta nova e entrar na pasta Compiladores
cd Compiladores

# 2. Garantir que não há resíduos de execuções anteriores
docker compose down --rmi local -v

# 3. Subir do zero, sem cache
docker compose build --no-cache
docker compose up -d

# 4. Verificar
docker compose ps                  # os dois serviços devem estar "Up"
bash scripts/smoke_test.sh         # todas as verificações devem passar
# abrir http://localhost:8080, escolher um exemplo e clicar em "Analisar código"

# 5. Testes automatizados
bash scripts/testar.sh

# 6. Encerrar
docker compose down
```

As execuções reais e pendências são registradas em `docs/testes-etapa3.md`. Não há resultado presumido para um ambiente limpo.

## 13. Solução de problemas

- **Porta 8080 ocupada:** execute `PORTA_WEB=8083 docker compose up --build -d` e acesse `http://localhost:8083`. Para o smoke test: `BASE_URL=http://localhost:8083 bash scripts/smoke_test.sh`. O projeto Compose tem nome `compiladores-etapa3` e usa nomes automáticos de contêineres para coexistir com a etapa anterior.
- **Erro "container name already in use":** há contêineres de uma execução anterior. Rode `docker compose down` na pasta antiga ou `docker rm -f edu-backend edu-frontend`.
- **Interface mostra "Não foi possível comunicar com o servidor":** veja os logs com `docker compose logs backend` e confirme que `docker compose ps` mostra o backend como `healthy`.
- **Lista de exemplos indisponível:** é o mesmo problema de comunicação com o backend. A área de código continua utilizável.

## 14. Limitações conhecidas

- **Não há análise sintática nem semântica.** Um resultado léxico bem-sucedido apenas confirma o reconhecimento das unidades do subconjunto.
- Python completo não é suportado: strings, laços, funções, classes, importações e outras construções não são parte desta entrega.
- O limite de tamanho da entrada é de 10.000 caracteres.
- Os testes de interface verificam a estrutura (HTML/CSS) e a lógica do controlador, mas **não há teste automatizado que abra um navegador real**.
- Não há banco de dados.

## 15. Próximas etapas

Na Etapa 4 será implementado o parser, aproveitando os tokens do scanner; a Etapa 5 tratará a semântica. Tutorial inicial e demonstração: [`docs/demonstracao-etapa3.md`](docs/demonstracao-etapa3.md).

## 16. Entrega e GitHub

A versão entregue no ZIP amplia o código da Etapa 2. O repositório indicado na documentação anterior era `https://github.com/ThomazSMP/Compiladores.git`; essa indicação não significa que tenha ocorrido publicação desta entrega. Para atualizar o repositório, copie os arquivos para o checkout, revise as alterações, execute os testes e registre um commit descritivo, por exemplo `Implementa scanner do subconjunto Python e exibição de tokens`. Não envie credenciais ou arquivos `.venv`.

A documentação e a navegação didática são decisões fundamentadas no objetivo educacional; não se afirma que sejam inéditas frente às ferramentas pesquisadas.
