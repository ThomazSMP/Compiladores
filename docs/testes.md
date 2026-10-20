# Registro dos testes

Este arquivo registra o que foi testado, como, e com qual resultado. Só consta como "passou" o que foi
de fato executado; o que ainda não foi executado aparece como pendente.

## Como executar

| Conjunto | Comando |
|---|---|
| Backend (pytest) e frontend (node), no Docker | `bash scripts/testar.sh` |
| Implantação/integração (aplicação no ar) | `bash scripts/smoke_test.sh` |

## Etapa 2 — execuções realizadas durante o desenvolvimento

Ambiente: sandbox de desenvolvimento (Python 3.12.3, Node 22.22.2, Chromium via Playwright), **fora do Docker**.

| Funcionalidade / módulo | Tipo | Comando | Resultado |
|---|---|---|---|
| Validação da entrada e resumo (`validacao.py`) | Unitário | `python3 -m unittest discover -s tests -p "test_[ve]*.py"` (em `backend/`) | 16 aprovados, 0 reprovados (inclui `test_exemplos.py`) |
| Lógica do frontend (`logica.js`) | Unitário | `node --test "tests/*.test.js"` (em `frontend/`) | 13 testes aprovados |
| Controlador (exemplos, envio, falhas, cliques repetidos) | Unitário com dublês | idem | 22 testes aprovados |
| HTML/CSS (elementos exigidos, rótulos, scripts) | Interface (estática) | idem | 9 testes aprovados |
| **Total do frontend** | | `node --test "tests/*.test.js"` | **44 aprovados, 0 reprovados** |
| Interface em navegador real (exemplos, edição, envio, vazio, espaços, falha de rede, 502, 500, Ctrl+Enter, HTML digitado) | Ponta a ponta (manual/scriptado, não faz parte do repositório) | Chromium + Playwright contra um servidor de verificação que usa o frontend real e os módulos reais `validacao.py` e `exemplos.py` | 27 verificações aprovadas, 0 reprovadas |
| `scripts/smoke_test.sh` | Implantação/integração | `bash scripts/smoke_test.sh` | 9 aprovadas, 0 reprovadas — **contra o servidor de verificação, não contra o Docker** |

### Falhas encontradas e correções

- O comando `node --test tests/` falhou no Node 22 (trata o diretório como arquivo). Corrigido para `node --test "tests/*.test.js"`, também no `docker-compose.yml`.
- Uma verificação de "sem erros no console" falhava por causa das falhas de rede injetadas de propósito pelo próprio teste. Corrigida para observar apenas exceções JavaScript.

### Pendentes (ainda não executados)

- `backend/tests/test_api.py` (29 testes de endpoints com `TestClient`): exige FastAPI e httpx, ausentes no ambiente de desenvolvimento. Deve ser executado no Docker (`bash scripts/testar.sh`).
- `bash scripts/testar.sh` completo no Docker (pytest + node).
- `bash scripts/smoke_test.sh` contra os contêineres reais (`docker compose up -d`).
- Validação de instalação limpa da etapa 2 (seção 12 do README).

> Preencha abaixo conforme executar no Docker.

| Data | Comando | Aprovados | Reprovados | Observações |
|---|---|---|---|---|
| | `bash scripts/testar.sh` | | | |
| | `bash scripts/smoke_test.sh` | | | |

## Limitações dos testes

- Não há teste automatizado em navegador real dentro do repositório.
- Os testes de interface verificam a estrutura do HTML/CSS e o comportamento do controlador com dublês; o DOM em si é verificado manualmente.
