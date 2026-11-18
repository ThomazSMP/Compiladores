# Instrumento de avaliação por pares - versão 1.0

**Planejado em 18/11/2026; ainda não aplicado.** Instrumento próprio para este projeto, inspirado nas dimensões de interação, clareza e percepção discutidas na literatura relacionada. Não é um questionário SUS e não será convertido em pontuação SUS. Os itens não constituem, isoladamente, medida de aprendizagem.

## Apresentação e consentimento

Você está sendo convidado a experimentar um ambiente educacional sobre compiladores e comentar sua utilização. A participação é voluntária. Você pode deixar uma pergunta sem resposta ou interromper a atividade. Os dados serão apresentados de modo agregado para fins acadêmicos. Não serão solicitados nome, matrícula, e-mail ou telefone. Não há resposta certa no questionário de opinião.

- Li a apresentação e concordo em participar: **sim / não**. Se não, encerrar o formulário sem coletar as demais respostas.
- Código aleatório de participante: atribuído pelo responsável, sem ligação com identidade pessoal.
- Perfil: estudante de Computação / estudante de Inteligência Artificial / professor / outro perfil pertinente.
- Situação em Compiladores: cursando / já cursou / não cursou. A inclusão principal requer cursando ou já cursou; demais perfis, se aceitos para revisão, serão descritos à parte.
- Contexto principal desta atividade: computador / celular / tablet; laboratório / estudo remoto / outro.
- Experiência anterior com Python: nenhuma / básica / intermediária ou maior. Não usar esse item para supor conhecimento de compiladores.

## Registro de tarefas pelo observador

Para cada tarefa, anotar código, revisão do software, dispositivo, se concluiu sem ajuda/com ajuda/não concluiu, tempo aproximado, erro de interação e observação. Não filmar nem coletar dados identificáveis por padrão.

| Tarefa | Solicitação | O que observar |
|---|---|---|
| T1 | Inserir CT-02 e executar a análise. | Consegue localizar o comando e a tabela; não confunde lexema com categoria. |
| T2 | Comparar o agrupamento de CT-02 e CT-03 na AST. | Localiza operadores e explica o efeito dos parênteses. Aplicar só quando houver AST. |
| T3 | Localizar os ramos de CT-07/CT-08. | Navega pela árvore e identifica o else correspondente; pedidos de ajuda. |
| T4 | Encontrar a causa de CT-17 e CT-24. | Distingue erro léxico de sintático e localiza o trecho indicado. |
| T5 | Relacionar um nó ao trecho de origem. | Consistência entre código, token e posição do nó. Aplicar quando implementado. |
| T6 | Repetir uma exploração curta em tela móvel, se oferecida. | Seleção por toque/teclado, legibilidade e manutenção do contexto; não generalizar o resultado de computador. |

## Escala de resposta

Para cada afirmação: **1 discordo totalmente; 2 discordo; 3 nem concordo nem discordo; 4 concordo; 5 concordo totalmente; N/A não utilizei ou não pude avaliar**. Não substituir N/A por 3. Não calcular uma nota global que misture funcionalidade, satisfação e aprendizagem percebida.

1. Entendi como inserir ou selecionar um programa e solicitar a análise.
2. Os nomes das fases e os controles da interface foram claros.
3. A tabela me permitiu distinguir a categoria de um token do seu lexema.
4. As posições de linha e coluna ajudaram a localizar o trecho do código.
5. As mensagens indicaram claramente a fase do problema e o que precisava ser revisto.
6. Consegui distinguir uma falha léxica de uma falha sintática.
7. A árvore apresentou hierarquia e rótulos legíveis. **N/A enquanto a AST não estiver implementada.**
8. Consegui expandir/recolher a árvore sem perder o trecho que estava examinando. **N/A quando indisponível.**
9. A relação entre fonte, tokens e nó selecionado tornou o processamento mais compreensível. **N/A quando indisponível.**
10. A apresentação de INDENT/DEDENT ajudou a relacionar a indentação de Python à estrutura dos blocos.
11. Os exemplos curtos em Python foram adequados ao meu conhecimento prévio.
12. As explicações em português foram suficientes para iniciar a exploração sem ajuda do desenvolvedor.
13. O controle de revisão dos tokens me permitiu avançar e retornar no meu ritmo.
14. Foi claro que sucesso léxico não significa que o programa esteja sintaticamente correto.
15. Foi claro quais recursos de Python não pertencem ao subconjunto do ambiente.
16. O material de apoio me ajudou a reproduzir um exemplo e interpretar o resultado.
17. No dispositivo utilizado, consegui acionar os controles e ler os resultados sem dificuldade.
18. Ao usar teclado ou toque, consegui concluir as ações previstas. **N/A se não utilizou essa forma de interação.**
19. As mensagens foram compreensíveis sem depender exclusivamente de cores.
20. A integração das representações foi útil para acompanhar as etapas do programa. **N/A para uma integração ainda indisponível.**
21. Percebi que a ferramenta contribuiu para minha compreensão de compiladores. **Percepção autorrelatada, não ganho medido.**
22. A representação das informações semânticas foi compreensível. **Não aplicar na Etapa 4; somente após implementação da Etapa 5.**

Os itens 9-16 e 20 tratam diretamente da contribuição pretendida: coordenação das representações, explicação localizada, indentação de Python, progressão e documentação. Sua presença no formulário não demonstra que esses recursos sejam inéditos nem eficazes.

## Questões abertas

1. Qual mensagem ou representação ficou mais difícil de compreender? Indique o exemplo ou a tarefa.
2. Em que momento você perdeu o contexto ao navegar? O que ajudaria a recuperá-lo?
3. Encontrou problema técnico? Descreva entrada, ação e resultado, sem incluir dados pessoais.
4. Qual aspecto da relação entre código, tokens e AST ficou mais claro ou continuou confuso?
5. A indentação e os tokens INDENT/DEDENT foram úteis? O que deveria mudar na explicação?
6. Quais alterações você sugere para computador, celular ou uso por teclado?
7. Há alguma necessidade de acesso não atendida que deseja relatar voluntariamente? Não é necessário identificar condição pessoal ou diagnóstico.

## Tratamento previsto

Apresentar número de respostas válidas e N/A por item, distribuição da escala, mediana quando pertinente e comentários por tema. Separar perfis e dispositivos, sem estimar uma amostra inexistente. Os dados das tarefas (conclusão/tempo/ajuda) não devem ser substituídos pelas respostas de opinião. Um estudo de aprendizagem com pré/pós-teste requer instrumento adicional e definição prévia própria.
