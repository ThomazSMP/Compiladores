# Software Educacional de Análise de Código

Software educacional web para demonstrar as fases de **análise léxica, sintática e semântica** de uma linguagem de programação.

> **Status:** Etapa 1 concluída: estrutura do projeto, ambiente Docker e aplicação "Hello, World!".

## 1. Linguagem escolhida

**Linguagem analisada: Python.**

**Por quê?**
- Sintaxe enxuta e legível, o que facilita escrever o analisador e explicar os resultados para quem está aprendendo.
- A indentação como delimitador de bloco gera um bom caso de estudo para a análise léxica (tokens `INDENT`/`DEDENT`).
- É a mesma linguagem usada no backend, o que permite reaproveitar bibliotecas e testes.

**Subconjunto inicial** (será ampliado nas próximas etapas):

| Construção | Exemplo |
|---|---|
| Atribuição / declaração implícita de variáveis | `x = 10` |
| Literais inteiros e de ponto flutuante | `3`, `2.5` |
| Operadores aritméticos | `+  -  *  /` e parênteses |
| Operadores relacionais | `==  !=  <  >  <=  >=` |
| Estrutura condicional | `if / else` |

Ficam **fora** do escopo inicial: funções, classes, laços, listas, strings, importações etc.

## 2. Arquitetura

```
software-educacional/
├── backend/            # API em Python (FastAPI)
│   ├── app/main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/           # Interface web estática servida pelo Nginx
│   ├── index.html
│   ├── nginx.conf      # também repassa /api/* ao backend
│   └── Dockerfile
├── docker-compose.yml  # sobe frontend + backend com um comando
├── .gitignore
└── README.md
```

- **Frontend:** página HTML servida pelo Nginx (porta 8080 no host). Chama `/api/hello`.
- **Backend:** FastAPI + Uvicorn (porta 8000, acessível apenas dentro da rede do Compose). Responde `{"message": "Hello, World!"}`.
- **Banco de dados:** não necessário nesta etapa.

## 3. Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) 24 ou superior
- Docker Compose v2 (já incluso no Docker Desktop; comando `docker compose`)
- Git

Verifique as versões:

```bash
docker --version
docker compose version
```

## 4. Como executar

```bash
git clone <URL-DO-REPOSITORIO>
cd software-educacional
docker compose up --build
```

Acesse **http://localhost:8080**. Deve aparecer a mensagem **Hello, World!**.

Para rodar em segundo plano:

```bash
docker compose up --build -d
```

Para testar apenas o backend (opcional), com os contêineres no ar:

```bash
curl http://localhost:8080/api/hello
# {"message":"Hello, World!"}
```

## 5. Como encerrar

```bash
docker compose down
```

Para remover também as imagens construídas:

```bash
docker compose down --rmi local
```

## 6. Validação de instalação limpa

Roteiro para simular uma máquina que nunca viu o projeto:

```bash
# 1. Clonar em uma pasta nova
git clone <URL-DO-REPOSITORIO> /tmp/teste-limpo && cd /tmp/teste-limpo

# 2. Garantir que não há resíduos de execuções anteriores
docker compose down --rmi local -v

# 3. Subir do zero, sem cache
docker compose build --no-cache
docker compose up -d

# 4. Verificar
docker compose ps                      # os dois serviços devem estar "Up"
curl http://localhost:8080/api/hello   # deve retornar o JSON
# abrir http://localhost:8080 no navegador e conferir "Hello, World!"

# 5. Encerrar
docker compose down
```

Registro da validação (preencher após executar):

| Data | Sistema operacional | Versão do Docker | Resultado |
|---|---|---|---|
| __/__/____ | | | |

## 7. Solução de problemas

- **Porta 8080 ocupada:** altere o mapeamento em `docker-compose.yml` (`"8081:80"`) e acesse a nova porta.
- **Página mostra "Erro":** veja os logs com `docker compose logs backend`.

## 8. Próximas etapas

Analisador léxico, analisador sintático, análise semântica e visualização dos resultados na interface.
