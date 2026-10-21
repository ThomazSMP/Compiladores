# Software Educacional de Análise de Código

Software educacional web para demonstrar as fases de **análise léxica, sintática e semântica** de uma linguagem de programação.

> **Status:** Etapa 2 concluída: interface web, entrada de código-fonte, exemplos, comunicação frontend ↔ backend, validações e testes automatizados.
> **Ainda não implementado:** as análises léxica, sintática e semântica. Hoje o sistema **recebe, valida e confirma o recebimento** do código; os analisadores serão desenvolvidos nas próximas etapas.

## 1. Objetivo

Ajudar estudantes de graduação a compreender como um compilador processa um programa. O usuário escreve (ou escolhe) um código, solicita a análise e vê o resultado em uma interface web.

## 2. Linguagem escolhida

**Linguagem analisada: Python (subconjunto).**

- Sintaxe enxuta e legível, o que facilita explicar os resultados para quem está aprendendo.
- A indentação como delimitador de bloco é um bom caso de estudo para a análise léxica (tokens `INDENT`/`DEDENT`).
- É a mesma linguagem do backend, o que permite reaproveitar bibliotecas e testes.

**Subconjunto previsto:**

| Construção | Exemplo |
|---|---|
| Atribuição / declaração implícita de variáveis | `x = 10` |
| Literais inteiros e de ponto flutuante | `3`, `2.5` |
| Operadores aritméticos | `+  -  *  /` e parênteses |
| Operadores relacionais | `==  !=  <  >  <=  >=` |
| Estrutura condicional | `if / else` |

Ficam **fora** do escopo inicial: funções, classes, laços, listas, strings, importações etc.

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
├── docs/testes.md           # registro dos testes realizados
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
git clone https://github.com/ThomazSMP/Compiladores.git
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
2. **Resultados** (direita): mostra o retorno do backend, as mensagens de validação e as falhas de comunicação. Nas próximas etapas receberá também os resultados das análises.

O sistema **não presume que o código é válido**: programas com erros de sintaxe também são aceitos e enviados, pois nas próximas etapas eles serão usados para demonstrar como o compilador identifica problemas.

### Exemplos disponíveis

| Exemplo | Código | O que pretende demonstrar |
|---|---|---|
| Atribuição de variáveis | `x = 10`<br>`y = 2.5` | Identificadores, operador `=` e literais inteiros e de ponto flutuante |
| Operações aritméticas | `a = 10`<br>`b = 5`<br>`resultado = (a + b) * 2 - 3 / 1` | Operadores `+ - * /`, parênteses e precedência |
| Estrutura condicional | `numero = 10`<br>`if numero > 0:`<br>`    numero = numero + 1`<br>`else:`<br>`    numero = 0` | `if/else`, operador relacional, `:` e blocos por indentação (`INDENT`/`DEDENT`) |
| Código com erro intencional | `x = 10 +`<br>`if x > :`<br>`    y = = 2` | Erros de propósito (operando ausente, condição incompleta, `=` duplicado), para as etapas em que os analisadores identificarão problemas |

Os exemplos ficam no backend (`backend/app/exemplos.py`) e são entregues pelo endpoint `GET /api/exemplos`.

## 9. Comunicação frontend ↔ backend

O navegador só conversa com o Nginx (porta 8080). O Nginx repassa tudo que começa com `/api/` ao serviço `backend` (porta 8000, acessível apenas dentro da rede do Compose). Assim o frontend usa caminhos relativos (`/api/...`) e não depende de endereços que só funcionem na máquina de desenvolvimento.

### `POST /api/analisar`

Requisição:

```json
{ "codigo": "x = 10" }
```

Resposta de sucesso (`200`):

```json
{
  "recebido": true,
  "mensagem": "Código recebido com sucesso.",
  "resumo": { "linhas": 1, "caracteres": 6 }
}
```

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

## 11. Testes automatizados

| Tipo | Onde | Ferramenta |
|---|---|---|
| Unitários (validação, exemplos) | `backend/tests/test_validacao.py`, `test_exemplos.py` | pytest / unittest |
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

Os resultados das execuções estão registrados em [`docs/testes.md`](docs/testes.md).

## 12. Validação de instalação limpa

Roteiro para simular uma máquina que nunca viu o projeto:

```bash
# 1. Clonar em uma pasta nova
git clone https://github.com/ThomazSMP/Compiladores.git /tmp/teste-limpo && cd /tmp/teste-limpo

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

**Registro das validações** (preencher após executar):

| Etapa | Data | Sistema operacional | Versão do Docker | Resultado |
| 1 | 11/10/2026 | macOS | Não registrada | Build sem cache concluído, `edu-backend` saudável e `edu-frontend` no ar; `curl http://localhost:8080/api/hello` retornou `{"message":"Hello, World!"}` |
| 2 | 20/10/2026 | macOS | 29.9.1 | `bash scripts/testar.sh`: backend 45 aprovados e frontend 44 aprovados; `bash scripts/smoke_test.sh`: 9 de 9 aprovadas; interface acessada em `http://localhost:8080`; instalação limpa validada com reconstrução sem cache |

## 13. Solução de problemas

- **Porta 8080 ocupada:** altere o mapeamento em `docker-compose.yml` (`"8081:80"`) e acesse a nova porta (para o smoke test, use `BASE_URL=http://localhost:8081 bash scripts/smoke_test.sh`).
- **Erro "container name already in use":** há contêineres de uma execução anterior. Rode `docker compose down` na pasta antiga ou `docker rm -f edu-backend edu-frontend`.
- **Interface mostra "Não foi possível comunicar com o servidor":** veja os logs com `docker compose logs backend` e confirme que `docker compose ps` mostra o backend como `healthy`.
- **Lista de exemplos indisponível:** é o mesmo problema de comunicação com o backend. A área de código continua utilizável.

## 14. Limitações conhecidas

- **Não há análise léxica, sintática nem semântica.** O backend só valida o texto e devolve um resumo (linhas e caracteres).
- Não há realce de sintaxe, numeração de linhas nem autocompletar (recursos opcionais nesta etapa).
- O limite de tamanho da entrada é de 10.000 caracteres.
- Os testes de interface verificam a estrutura (HTML/CSS) e a lógica do controlador, mas **não há teste automatizado que abra um navegador real**.
- Não há banco de dados.

## 15. Próximas etapas

Analisador léxico, analisador sintático, análise semântica e visualização dos resultados na interface.
