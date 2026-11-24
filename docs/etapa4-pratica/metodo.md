# Notas para Materiais e Métodos

Este registro complementa a [proposta acadêmica de 18/11](../etapa4/trabalho-etapa4.md) com o estado da implementação prática. A versão original continua documentando o que estava disponível antes do parser e preserva o protocolo definido previamente.

## Materiais

O sistema analisa um subconjunto de Python voltado a estudantes de Compiladores. A interface usa HTML, CSS e JavaScript e é servida pelo Nginx. O FastAPI valida a entrada e encaminha a lista de tokens do scanner ao parser em Python. O Docker Compose empacota o servidor web, a API e os serviços de teste. A gramática formal, os exemplos e a explicação da AST fazem parte dos materiais didáticos. [Gramática](gramatica.md) · [Formato das respostas](parser-e-ast.md)

## Procedimento

O parser descendente recursivo associa as produções da EBNF a rotinas de reconhecimento. A leitura por níveis de precedência organiza operações e comparações. O parser constrói a AST em memória e mantém as posições do código em cada nó. Na interface, o estudante compara os tokens com a hierarquia do programa. ParVis, descrito por Costagliola et al. (2022), fundamentou a decisão de colocar várias representações do processamento ao alcance do estudante. Sua avaliação e suas árvores de derivação pertencem ao sistema estudado pelos autores. [Fluxograma implementado](fluxograma.md) · [Estudo ParVis](https://doi.org/10.1007/s11042-021-10624-6)

## Avaliação e alcance

A avaliação técnica compara aceite, posições, diagnósticos e agrupamentos com resultados esperados definidos antes da implementação. O plano inclui entradas válidas, inválidas e de borda. A separação entre domínio do teste, resultado de referência e reprodução de falhas segue o cuidado metodológico discutido na revisão de YARPGen por Livinskii et al. (2020). A execução desta etapa usa os casos do recorte de Python documentado, com a semântica reservada para a Etapa 5. [Protocolo congelado](../etapa4/protocolo-avaliacao.md) · [Casos e oráculos](../etapa4/casos-de-teste.md) · [Estudo YARPGen](https://doi.org/10.1145/3428264)

A combinação de gramática publicada, visualização abrangendo fonte, tokens e AST e diagnóstico com referência à regra é o diferencial pretendido para o uso em aula. O formulário de avaliação por pares permanece previsto. Os testes técnicos verificam o comportamento do software. Conclusões sobre aprendizagem requerem dados de participantes e um método de avaliação próprio. [Instrumento planejado](../etapa4/formulario-pares.md)
