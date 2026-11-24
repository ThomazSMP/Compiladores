# Demonstração da análise sintática

Na pasta raiz do projeto, inicie o backend e o frontend com o Docker Compose.

```bash
docker compose up --build -d
docker compose ps
```

Abra [a interface em localhost:8080](http://localhost:8080). Se a porta estiver em uso, suba o projeto com `PORTA_WEB=8083 docker compose up --build -d` e abra a porta 8083. Mantenha o navegador no mesmo endereço durante o roteiro.

| Passo | O que mostrar |
|---|---|
| 1. Abra o exemplo **Operações aritméticas** e substitua seu conteúdo por `resultado = 10 + 5 * 2`. Clique em **Analisar código**. | A tabela mostra o nome, a atribuição, os números e os operadores. Na **Árvore sintática abstrata (AST)**, a atribuição tem uma adição como valor e a multiplicação está no ramo direito da adição. |
| 2. Clique em **Recolher tudo** e **Expandir tudo**. Selecione **Operação binária `*`**. | A árvore alterna entre a visão geral e a detalhada. A seleção do nó identifica no editor o trecho `5 * 2`. |
| 3. Troque a fonte por `resultado = (10 + 5) * 2` e analise. | A raiz da expressão agora é a multiplicação e a adição aparece como seu filho esquerdo. |
| 4. Carregue **Estrutura condicional** e analise. | Compare `INDENT` e `DEDENT` na tabela com os comandos que aparecem nos ramos `entao` e `senao` do condicional na AST. |
| 5. Digite `x = (2 + 3` e analise. | Os tokens continuam disponíveis. O diagnóstico sintático indica a ausência de `)` e localiza o fim da entrada na linha 1, coluna 11. |
| 6. Digite `x = = 2` e analise. | O segundo `=` é um token válido em uma posição inválida. O diagnóstico sintático localiza a coluna 5 e indica o que poderia iniciar a expressão. |
| 7. Digite `x = @ 2` e analise. | O scanner localiza `@` na coluna 5. A interface explica que a análise sintática ficou suspensa. |
| 8. Volte a `x = 2 + 3 * 4` e analise. | A AST volta a ser exibida na mesma sessão. |

Se editar a fonte após a análise, analise novamente antes de selecionar um nó. A árvore conserva as posições da última entrada analisada.

O [fluxograma](fluxograma.md) explica os caminhos percorridos no roteiro. A [gramática](gramatica.md) descreve o recorte usado. As [notas de Materiais e Métodos](metodo.md) relacionam o roteiro com o plano acadêmico.

## Capturas da aplicação em execução

- [AST de `resultado = 10 + 5 * 2`, com o trecho `5 * 2` selecionado no editor](ast-desktop.png).
- [Erro sintático por parêntese aberto, com os tokens preservados](erro-sintatico.png).
- [Condicional `if/else` em uma janela de 390 px de largura](ast-celular.png).

## Verificação automatizada do roteiro

Com a aplicação no ar, execute o teste HTTP pela raiz do projeto.

```bash
BASE_URL=http://localhost:8080 bash scripts/smoke_test.sh
```

O teste de navegador usa Playwright e Chromium. Instale a ferramenta somente se for reproduzir esse teste.

```bash
npm install --no-save --package-lock=false playwright
npx playwright install chromium
BASE_URL=http://localhost:8080 node scripts/teste_navegador_etapa4.cjs
```

Use `CAPTURAR_ETAPA4=1` para gerar as capturas em `docs/etapa4-pratica/`. Use `CHROMIUM_EXECUTABLE` para indicar um executável já disponível, se necessário. Troque a porta em `BASE_URL` se usou `PORTA_WEB`. O [registro dos testes](registro-testes.md) identifica as verificações efetivamente executadas.

Encerre com `docker compose down` na mesma pasta e no mesmo projeto Compose.
