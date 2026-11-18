# Verificação técnica da entrega metodológica

Data: 18/11/2026. Esta verificação é separada da futura avaliação com parser/AST e com participantes.

Os arquivos do protocolo v1.0 foram registrados com SHA-256 em `congelamento-protocolo.json` antes de executar os novos testes. A data/hora UTC do registro e a revisão-base estão nesse arquivo. Os oráculos não foram reescritos após observar os resultados.

| Verificação executada após o registro | Resultado observado |
|---|---|
| Em `backend/`: `python -m pytest -q` | 119 aprovados, 26 ignorados explicitamente, nenhuma falha; 1 aviso de depreciação de dependência. |
| Na raiz: `node --test frontend/tests/*.test.js` | 52 aprovados, nenhuma falha. |
| Na raiz: `docker compose config --quiet` | Configuração válida. |

Os 119 resultados aprovados de backend correspondem a 102 testes anteriores, 14 verificações das fases disponíveis nos casos planejados e 3 verificações estruturais do plano. Os 26 `skip` correspondem a 22 casos de sintaxe e 4 de semântica, sem implementação; não são aprovados. As expectativas futuras de CT-17 (bloqueio do parser) e CT-38 (AST vazia) também continuam pendentes, apesar da verificação de sua parte léxica.

Dos 40 casos do plano, 14 tiveram verificação da parte atualmente disponível, sendo 12 sem expectativa adicional futura e 2 com alcance parcial. A parte do analisador ainda não implementada não foi executada. Os casos canônicos permanecem com campos de resultado nulos para preservar a definição prévia; os resultados observados são registrados separadamente aqui e no relatório de execução.

Ambiente de verificação: macOS (Darwin 27.2.0), Python 3.12 em ambiente virtual, Node do runtime de validação. Docker CLI 29.9.1 e Compose 5.6.0 foram consultados. O servidor Docker estava desligado; o fluxo de contêineres não foi novamente executado nesta etapa. O histórico de funcionamento da Etapa 3 é preservado em `../testes-etapa3.md`, sem transformá-lo em aprovação atual de parser/AST. O Compose acrescentou uma montagem somente para leitura de `docs` no serviço de testes, para ler os casos canônicos.

Não houve coleta por formulário, recrutamento, estudo de aprendizagem, teste da AST no navegador nem resultados semânticos. As figuras de arquitetura e fluxo representam o estado atual e os módulos previstos com rótulos distintos.
