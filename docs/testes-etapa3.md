# Registro dos testes - Etapa 3

Este registro complementa `testes.md`, que preserva o histórico da Etapa 2. Resultados só devem ser marcados como aprovados depois de executar os respectivos comandos. Nenhum teste técnico comprova ganho de aprendizagem.

## Comandos reproduzíveis

| Verificação | Comando (a partir da pasta indicada) |
|---|---|
| Backend completo, incluindo scanner, API e regressão | Em `backend/`: `python -m pytest -q` |
| Frontend completo | Em `frontend/`: `node --test 'tests/*.test.js'` |
| Testes no Docker | Na raiz: `bash scripts/testar.sh` |
| Configuração Docker | Na raiz: `docker compose config --quiet` |
| Inicialização dos serviços | Na raiz: `docker compose up --build -d` |
| Integração HTTP/proxy | Com a aplicação no ar: `bash scripts/smoke_test.sh` |
| Estado dos serviços | `docker compose ps` |

## Cobertura esperada

- Scanner: palavras reservadas, identificadores, inteiros e reais, operadores simples/compostos, delimitadores, comentários, espaços e posições.
- Recuperação: mais de um erro no mesmo programa, sequências malformadas e continuidade após erro.
- Bordas: fonte vazia, espaços, comentário sem quebra final, token no fim do arquivo, indentação e retorno de blocos.
- Separação de fases: estrutura sintaticamente incompleta, composta apenas por tokens válidos, não deve ser recusada como erro sintático.
- API: contrato de tokens/erros, HTTP 200 para análise processada (mesmo com erro léxico), HTTP 400/413 para entrada inválida e manutenção dos endpoints anteriores.
- Interface: exibição de tokens e erros, edição e exemplos preservados, ausência de interpretação do código como HTML.

## Execuções desta entrega

O relatório de execução será preenchido com os comandos e resultados efetivamente observados durante a validação. Caso Docker ou navegador não possam ser executados, isso deve permanecer explicitamente pendente.

| Verificação | Resultado observado em 29/10/2026 |
|---|---|
| Testes de backend | Executado em 29/10/2026: `python -m pytest -q` na pasta `backend/`, com ambiente virtual de validação. **102 aprovados**, 1 aviso de depreciação Starlette/AnyIO, nenhuma falha; 0,63 s. Inclui scanner, API e regressão. |
| Testes de frontend | **52 aprovados**, nenhuma falha, tanto com Node local quanto `docker compose --profile test run --rm frontend-tests`. |
| Docker Compose e integração nos contêineres | Docker Engine **29.9.1**; `docker compose config --quiet` aprovado. `PORTA_WEB=8083 docker compose up -d --build` concluído: backend saudável e frontend disponível. `BASE_URL=http://localhost:8083 bash scripts/smoke_test.sh`: **13 aprovados, 0 falhas**. |
| Navegador real | Chrome via Playwright, `BASE_URL=http://localhost:8083 node scripts/teste_navegador.cjs`: **5 verificações aprovadas**, exemplos, tabela, navegação, múltiplos erros/recuperação, sintaxe incompleta, entrada vazia e viewport de celular 390×844; nenhum erro JavaScript. Capturas em `demonstracao-desktop.png` e `demonstracao-celular.png`. |

### Ocorrência corrigida

O primeiro início do Compose encontrou nomes fixos `edu-backend`/`edu-frontend` já utilizados pela Etapa 2. Foram removidos `container_name`, definido o projeto `compiladores-etapa3` e parametrizada a porta por `PORTA_WEB` (padrão 8080). A validação usou 8083, sem remover os contêineres antigos. O fluxo completo foi repetido e aprovado.

### Reproduzir a verificação de navegador (opcional)

Na raiz, instale `npm install --no-save playwright` e `npx playwright install chromium`; execute `BASE_URL=http://localhost:8083 node scripts/teste_navegador.cjs`. A validação desta entrega usou Chrome já instalado, indicado pela variável `CHROMIUM_EXECUTABLE`, e Playwright do ambiente de verificação. Os 52 testes Node normais não precisam dessa dependência.

## Critério de interpretação

Uma falha de infraestrutura (por exemplo, Docker indisponível) não é resultado positivo nem falha funcional do scanner. Registre o impedimento e o procedimento ainda pendente. Falhas reais devem ser corrigidas e os testes afetados reexecutados.
