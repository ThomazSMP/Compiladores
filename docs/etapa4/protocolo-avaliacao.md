# Protocolo de avaliação - versão 1.0

**Definição prévia:** 18/11/2026. **Base inspecionada:** commit `5d9d81acfff427d07e4f2229a9a363948a737835`. **Estado:** congelado para execução posterior. Esta versão contém critérios, instrumentos e oráculos, não resultados da avaliação. O histórico da Etapa 3 é anterior e não comprova funcionamento de parser ou AST.

## 1. Objetivo, estado do software e unidade avaliada

Avaliar se um ambiente web ajuda a explorar as relações entre fonte, tokens e estrutura sintática do subconjunto de Python, inicialmente verificando correção funcional e uso. Na base inspecionada existem entrada/validação, exemplos, scanner, API e apresentação dos tokens. Parser, AST e sua visualização ainda não existem. A análise semântica e a tabela de símbolos são previstas para a Etapa 5.

O plano não permite concluir que a ferramenta melhora a aprendizagem a partir de aprovação dos testes ou satisfação. Também não pretende validar Python completo. A avaliação humana será iniciada somente quando as tarefas que dependem de AST estiverem funcionais; até lá, itens correspondentes permanecem não aplicáveis ou pendentes.

## 2. Decisões propostas antes da implementação do parser

- Análise descendente recursiva, com níveis de precedência explícitos e gramática em `gramatica.ebnf`; é uma escolha de implementação para o recorte, não resultado de comparação experimental entre algoritmos.
- Entrada lexicalmente inválida bloqueia o parser. Os tokens reconhecidos e erros léxicos continuam disponíveis, enquanto `estado_sintatico` será `nao_executado` e `ast`, nula.
- Havendo primeiro erro sintático, interromper a construção e informar o que era esperado e encontrado, linha e coluna. Não afirmar recuperação sintática nem mostrar AST parcial como válida.
- AST em JSON com nós do domínio, hierarquia, rótulos e posições de origem; representação por árvore hierárquica expansível e versão textual equivalente. O foco de um nó deverá indicar sua posição no código. A AST não deverá conter cada terminal/não terminal da gramática como uma árvore de derivação.
- Limite atual: 10.000 caracteres. Limite proposto: 64 níveis de aninhamento de parênteses/blocos, retornando mensagem de limite do sistema, sem afirmar que o programa seria inválido em Python completo.
- O scanner nunca executa a entrada. Na proposta, o parser também não usará `eval`/`exec` nem executará o programa. A interface mantém inserção de textos com `textContent` e mensagens sem detalhes internos.
- Os campos atuais `recebido`, `mensagem`, `resumo`, `sucesso`, `tokens` e `erros` serão preservados. A extensão proposta acrescentará `ast`, `erros_sintaticos` e `estado_sintatico`; `erros` continuará exclusivamente léxico. O significado de `sucesso` seguirá o sucesso léxico para compatibilidade, enquanto a nova fase terá estado próprio (`nao_executado`, `valido` ou `invalido`). O frontend deverá ler esse estado para interpretar a sintaxe, sem converter sucesso léxico em sucesso sintático. A semântica futura deverá ter estado independente, sem simular conclusão.

## 3. Critérios observáveis e regras de aprovação

| ID | Critério | Medida e regra definida previamente | Base da escolha |
|---|---|---|---|
| C1 | Correção léxica | Tipos, lexemas e posições devem coincidir com o oráculo do caso; registrar também erros previstos e recuperados. Aprovação apenas com todos os campos exigidos corretos. | Escopo lexical existente; elaboração técnica do projeto. |
| C2 | Correção sintática | Cada entrada deve ser aceita ou recusada conforme a EBNF do recorte; não conforme Python completo. Casos com erro léxico não contam como execução do parser. | Gramática proposta; necessidade de separar as fases. |
| C3 | Correção da AST | Comparar esqueleto com os oráculos, incluindo precedência, associatividade, agrupamento e ramos. Não basta haver uma árvore não nula. | Objetivo educacional de representar estrutura; oráculos elaborados para o projeto. |
| C4 | Detecção e localização de erros | Exigir fase correta, lexema/elemento encontrado, esperado e posição previamente especificados quando houver. Marcar localização indisponível, não inventá-la. | Graciano Junior et al. (2022), §§5.1-5.2, p. 228-232, como referência de feedback localizado; verificações técnicas do projeto. |
| C5 | Clareza das mensagens | Inspeção confirma fase, localização e orientação específica; participantes explicam o problema com suas palavras. Registrar acertos, dificuldades e respostas ao item do formulário. | Graciano Junior et al. (2022), §§5.1-5.2; adaptação para sintaxe a verificar. |
| C6 | Legibilidade e navegação | Em tarefas com árvore: localizar raiz, operador e ramo solicitado; registrar conclusão sem ajuda, tempo e erros de navegação. Avaliar expansão/recolhimento, teclado e toque separadamente. | Costagliola et al. (2022), §§4-5, como referência para observar acerto, tempo e interação; tarefas e critérios da AST adaptados ao recorte deste projeto. |
| C7 | Consistência entre visualizações | Fonte, token e nó selecionado devem corresponder ao mesmo elemento; conferir CT-08 e CT-16 e tarefas de associação. Anotar divergências objetivas. | Borela et al. (2025), §3.2.3, p. 7, como referência de ligação entre código e representações; adaptação para AST. |
| C8 | Execução do plano | Informar números planejado, executado, aprovado, reprovado e pendente por fase. Taxa = aprovados/executados; mostrar também executados/planejados. Não incluir skips como aprovados. | Controle de avaliação elaborado para o projeto. |
| C9 | Limites e robustez | Rejeitar entrada vazia/extensa e aninhamento excessivo conforme contrato; não encerrar processo nem mostrar stack trace; erro léxico deve bloquear apenas a fase seguinte. | Validação existente e limites propostos do projeto. |
| C10 | Reprodutibilidade | Em ambiente limpo ou simulado documentado: obter a revisão, iniciar Compose, observar saúde dos serviços, executar exemplos e testes e registrar versões/portas. Uma execução local não prova todos os ambientes. | Procedimento já adotado nas etapas práticas, ampliado nesta proposta. |
| C11 | Documentação e uso | Um colega deve conseguir iniciar e seguir o tutorial, localizar escopo, interpretar um resultado e identificar uma limitação; registrar os passos não concluídos sem ajuda. | Materiais de apoio do projeto; avaliação por tarefas planejada. |
| C12 | Correção semântica futura | Casos CT-33 a CT-36 reservados para a Etapa 5: vinculação de nomes, reatribuição e avisos conservadores. Não executar nem contabilizar como resultado atual. | Modelo de execução de Python 3.12, §4.2; recorte explicitamente futuro. |

Os critérios funcionais de cada caso são binários conforme o oráculo; a meta de liberação será zero falha conhecida nos casos que pertençam à fase implementada. Essa meta de engenharia não é um resultado antecipado nem um limiar de eficácia pedagógica. Para usabilidade serão descritos conclusão, tempo, ajuda e dificuldades; não se estabelecerá retrospectivamente um corte para declarar sucesso. As três verificações estruturais do arquivo de plano não contam como casos funcionais do analisador. A execução somente da parte léxica de CT-17 ou CT-38 não aprova suas expectativas futuras de bloqueio do parser ou de AST vazia: registrar o alcance parcial separadamente.

## 4. Casos e oráculos

O conjunto contém 40 casos: válidos, erros léxicos, erros sintáticos, semântica futura e bordas. As entradas e saídas esperadas estão em `casos-de-teste.json` e na apresentação legível correspondente. Os casos foram elaborados para este projeto. ASTs de referência foram especificadas antes da implementação, não extraídas da saída do próprio futuro parser.

Não se exigirão ponto e vírgula/chaves, declaração sem inicialização, laços ou funções porque não pertencem ao recorte. `if` não cria um novo escopo em Python; reatribuição não será marcada como redeclaração ilegal. Um aviso estático sobre nome atribuído em apenas um ramo não será anunciado como `NameError` inevitável. Não há sistema geral de tipos estáticos proposto.

## 5. Testes técnicos e execução manual

1. Congelar esta versão e seus arquivos de casos/gramática antes da nova execução; registrar hash SHA-256 e revisão Git em arquivo de execução separado.
2. Executar os testes existentes de scanner, API, interface e regressão. O módulo `backend/tests/test_planejamento_etapa4.py` verifica o plano e executa somente as verificações já disponíveis; parser e semântica permanecem com `skip` explícito, sem aprovação fictícia.
3. Depois da implementação do parser, trocar cada `skip` correspondente por uma comparação efetiva com o oráculo; registrar a revisão e preservar a versão original do plano. Verificar o contrato do endpoint e a renderização da AST no navegador.
4. Repetir manualmente: inserir código -> analisar -> comparar tokens -> inspecionar AST ou erros. Registrar entrada, esperado, observado, status, defeito e correção. Casos de fonte inválida deverão confirmar a separação entre mensagens léxicas e sintáticas.
5. Executar Compose em cópia limpa ou ambiente simulado explicitado; registrar sistema operacional, Python, navegador, Docker/Compose, comandos, portas e estado de saúde. Encerrar os serviços de teste após registrar o resultado, sem remover ambientes alheios.

Comandos previstos a partir da raiz do repositório:

```sh
docker compose config --quiet
PORTA_WEB=8083 docker compose up --build -d
bash scripts/testar.sh
BASE_URL=http://localhost:8083 bash scripts/smoke_test.sh
docker compose ps
docker compose down
```

Execução local: em `backend/`, `python -m pytest -q`; em `frontend/`, `node --test 'tests/*.test.js'`. O teste opcional de navegador real é `BASE_URL=http://localhost:8083 node scripts/teste_navegador.cjs`, após preparar Playwright/Chromium conforme o README. Na etapa atual ele cobre o fluxo léxico; deve receber tarefas de AST quando houver essa interface. Se Docker ou outra dependência não estiver disponível, registrar pendência ou impedimento, sem converter isso em aprovação.

## 6. Avaliação por pares planejada

Pretende-se convidar de 6 a 10 participantes por conveniência, estudantes de Computação ou Inteligência Artificial que estejam cursando ou já tenham cursado Compiladores. Esse intervalo é uma meta de recrutamento, não amostra observada nem cálculo de poder estatístico. Professores poderão contribuir com revisão qualitativa do conteúdo; suas respostas serão identificadas como perfil docente e não misturadas às dos estudantes sem descrição.

Após consentimento, cada participante realizará aproximadamente 20-30 minutos de tarefas com exemplos fixos: analisar CT-02, comparar CT-03, interpretar CT-07/CT-08, localizar CT-17/CT-24 e explicar uma correspondência entre código, token e nó. O responsável observará se concluiu, tempo aproximado, pedidos de ajuda e erros de interação, usando códigos aleatórios de participante. Não se aplicarão tarefas de AST antes de sua implementação.

Serão oferecidos computador e, em uma exploração separada, celular ou viewport móvel; o dispositivo e o contexto serão registrados por categoria. Os resultados não serão generalizados entre dispositivos. O viewport automatizado apenas verifica comportamento de layout; não substitui interação por toque ou estudo com pessoas.

Depois das tarefas, será aplicado formulário on-line ou equivalente, definido em `formulario-pares.md`, com escala de concordância 1-5 e opção não aplicável. Serão apresentadas distribuições por item e comentários agrupados, sem imputar respostas ausentes. As notas de usabilidade, a percepção de aprendizagem e o desempenho nas tarefas permanecerão separados.

## 7. Aprendizagem: limite e estudo posterior

Koitz-Hristov et al. (2025), §4, p. 607-608, fornecem um exemplo de distinção entre desempenho medido e percepção de competência. Seu desenho não será transplantado como prova de validade deste protocolo. Nesta avaliação por conveniência, opinião de que a ferramenta ajuda e sucesso em navegação não serão tratados como ganho cognitivo.

Um estudo posterior poderá usar questões conceituais equivalentes antes/depois e grupo de comparação, com critérios, instrumentos e análise definidos previamente. Isso exige protocolo adicional; não se antecipam tamanho de efeito, significância ou superioridade. A presente etapa documenta o método e a avaliação técnica inicial, não resultados de aprendizagem do parser.

## 8. Privacidade, limitações e alterações

Não coletar nome, matrícula, e-mail, telefone ou dados desnecessários. Solicitar apenas perfil geral, situação na disciplina e categoria de dispositivo. O formulário não deverá registrar login obrigatório ou e-mail automaticamente. Informar voluntariedade, possibilidade de não responder e uso acadêmico agregado; a coleta só começará após os procedimentos institucionais aplicáveis ao contexto serem definidos. Não há recrutamento ou respostas nesta etapa.

A amostra de conveniência, o recorte reduzido, a participação do desenvolvedor nas tarefas e a ausência de comparação controlada limitam a generalização. As respostas de professores e estudantes não são intercambiáveis. Limitações de acessibilidade não serão inferidas por silêncio dos artigos nem declaradas resolvidas por teste automatizado.

Qualquer alteração no protocolo, na gramática, nos casos ou nos critérios exigirá nova versão, data, motivo e impacto sobre casos já executados. O registro de execução deve apontar a versão/hash usada e separar resultado inicial de reexecução após correção.

## Referências de apoio

- GRACIANO JUNIOR, W. et al. Ferramenta interativa para o ensino de compiladores. EduComp, p. 224-233, 2022. DOI: https://doi.org/10.5753/educomp.2022.19217.
- BORELA, E. P. S. et al. Uma ferramenta educacional de apoio ao ensino de compiladores. WEI, p. 171-181, 2025. DOI: https://doi.org/10.5753/wei.2025.7407.
- KOITZ-HRISTOV, R.; MANDL, F.; WOTAWA, F. VisOpt - Visualization of Compiler Optimizations for Computer Science Education. SIGCSE TS, v. 1, p. 603-609, 2025. DOI: https://doi.org/10.1145/3641554.3701832.
- COSTAGLIOLA, G. et al. Visual exploration of visual parser execution. Multimedia Tools and Applications, v. 81, p. 299-317, 2022. DOI: https://doi.org/10.1007/s11042-021-10624-6. Referência metodológica de visualização/interação, sem transferir seus resultados para a ferramenta Python.
- PYTHON SOFTWARE FOUNDATION. The Python Language Reference, Python 3.12: Execution model, §4.2. https://docs.python.org/3.12/reference/executionmodel.html. Fonte técnica complementar, não substitui os artigos científicos.
