# Registro dos testes

Este arquivo registra o que foi testado, como e com qual resultado. Só consta como "passou" o que foi
de fato executado.

## Como executar

| Conjunto | Comando |
|---|---|
| Backend (pytest) e frontend (node), no Docker | `bash scripts/testar.sh` |
| Implantação e integração (aplicação no ar) | `docker compose up --build -d` e depois `bash scripts/smoke_test.sh` |

## Etapa 2: execuções no ambiente Docker

Ambiente: macOS (MacBook Air), Docker Compose. Imagens: `python:3.12-slim` (Python 3.12.15, pytest 8.3.3) e `node:22-alpine`.

| Funcionalidade / módulo | Tipo | Comando | Resultado |
|---|---|---|---|
| Validação da entrada, resumo e exemplos (`validacao.py`, `exemplos.py`) | Unitário | `bash scripts/testar.sh` (pytest) | 16 aprovados, 0 reprovados |
| Endpoints `/api/hello`, `/api/exemplos` e `/api/analisar` (contrato, códigos HTTP, erros) | Endpoints / integração do backend | `bash scripts/testar.sh` (pytest) | 29 aprovados, 0 reprovados |
| **Total do backend** | | `bash scripts/testar.sh` (pytest) | **45 aprovados, 0 reprovados, 1 aviso** |
| Lógica do frontend, controlador e estrutura do HTML/CSS | Unitário e interface | `bash scripts/testar.sh` (`node --test`) | **44 aprovados, 0 reprovados** |
| Página, proxy do Nginx, contrato da API de ponta a ponta | Implantação e integração | `bash scripts/smoke_test.sh` (aplicação no ar) | **9 aprovadas, 0 reprovadas** |
| Regressão da etapa 1 (`GET /api/hello`) | Regressão | incluída nos testes de endpoints e no smoke test | Aprovada |

O aviso do pytest é um `DeprecationWarning` interno da biblioteca Starlette (alias do `anyio`) e não afeta o resultado.

### Validação de instalação limpa

Validação de instalação limpa realizada em 20/10/2026, no macOS, com Docker 29.9.1. As imagens foram reconstruídas sem cache e a aplicação iniciou corretamente. Smoke test: 9 verificações aprovadas, 0 falhas. Backend: 45 testes aprovados, 0 falhas e 1 aviso de descontinuação de dependência. Frontend: 44 testes aprovados, 0 falhas.

### Falhas encontradas durante o desenvolvimento e correções

- O comando `node --test tests/` falhou no Node 22 (trata o diretório como arquivo). Foi corrigido para `node --test "tests/*.test.js"`, também no `docker-compose.yml`.
- Uma verificação de "sem erros no console" falhava por causa das falhas de rede injetadas de propósito pelo próprio teste. Foi corrigida para observar apenas exceções JavaScript.

### Pendências e limitações

- Não há teste automatizado em navegador real dentro do repositório. A tela foi verificada manualmente.
- Os testes de interface verificam a estrutura do HTML/CSS e o comportamento do controlador com dublês; o DOM em si é verificado manualmente.
