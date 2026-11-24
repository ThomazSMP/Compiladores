/* Com Playwright/Chromium instalado:
   BASE_URL=http://localhost:8080 node scripts/teste_navegador_etapa4.cjs
   CAPTURAR_ETAPA4=1 grava imagens em docs/etapa4-pratica/. */
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const baseUrl = process.env.BASE_URL || 'http://localhost:8080';

async function captura(page, nome) {
  if (process.env.CAPTURAR_ETAPA4 !== '1') return;
  await page.screenshot({
    path: path.join(__dirname, '..', 'docs', 'etapa4-pratica', nome),
    fullPage: true,
    animations: 'disabled',
  });
}

async function analisar(page) {
  const [resposta] = await Promise.all([
    page.waitForResponse(r => r.url().endsWith('/api/analisar') && r.request().method() === 'POST'),
    page.locator('#btn-analisar').click(),
  ]);
  assert.equal(resposta.status(), 200);
  return resposta.json();
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 940 } });
  const erros = [];
  page.on('pageerror', erro => erros.push(erro.message));
  const codigo = page.locator('#codigo');
  const tabela = page.locator('.tabela-tokens');
  const arvore = page.locator('.arvore-ast');

  try {
    await page.goto(baseUrl);
    await page.waitForSelector('#exemplos:not([disabled])');
    await page.selectOption('#exemplos', 'atribuicao');
    assert.ok((await codigo.inputValue()).length > 0);
    await codigo.fill('resultado = 10 + 5 * 2');
    const valido = await analisar(page);
    await arvore.waitFor();
    assert.equal(valido.estado_sintatico, 'valido');
    const expressao = valido.ast.corpo[0].valor;
    assert.equal(expressao.operador, '+');
    assert.equal(expressao.direita.operador, '*');
    assert.match(await tabela.innerText(), /IDENTIFICADOR/);
    assert.equal(await tabela.locator('tbody tr').count(), valido.tokens.length);
    const multiplicacao = arvore.locator('.ast-no').filter({ hasText: /Operação binária\s*\*/ });
    await page.getByRole('button', { name: 'Expandir tudo', exact: true }).click();
    await multiplicacao.click();
    const selecao = await codigo.evaluate(editor => ({
      inicio: editor.selectionStart,
      fim: editor.selectionEnd,
      texto: editor.value.slice(editor.selectionStart, editor.selectionEnd),
    }));
    assert.deepEqual(selecao, { inicio: 17, fim: 22, texto: '5 * 2' });
    assert.equal(expressao.direita.coluna, 18);
    assert.ok(valido.tokens.some(token => token.lexema === '5' && token.coluna === 18));
    await captura(page, 'ast-desktop.png');
    await page.getByRole('button', { name: 'Recolher tudo', exact: true }).click();
    assert.equal(await multiplicacao.isVisible(), false);
    await page.getByRole('button', { name: 'Expandir tudo', exact: true }).click();
    assert.equal(await multiplicacao.isVisible(), true);
    console.log('OK: exemplo editado, tokens, precedência, navegação e destaque de 5 * 2');

    await codigo.fill('resultado = (10 + 5');
    const incompleto = await analisar(page);
    const errosSintaticos = page.locator('.erros-sintaticos');
    await errosSintaticos.waitFor();
    assert.equal(incompleto.sucesso, true);
    assert.equal(incompleto.ast, null);
    assert.equal(incompleto.estado_sintatico, 'invalido');
    assert.equal((await arvore.count()), 0);
    assert.match(await errosSintaticos.innerText(), /linha 1, coluna \d+/i);
    assert.match(await errosSintaticos.innerText(), /\)/);
    await captura(page, 'erro-sintatico.png');
    console.log('OK: expressão incompleta gera erro localizado com a tabela de tokens preservada');

    await codigo.fill('else:\n    x = 1');
    const senao = await analisar(page);
    assert.equal(senao.estado_sintatico, 'invalido');
    assert.equal(senao.erros_sintaticos[0].linha, 1);
    assert.match(await errosSintaticos.innerText(), /else/i);
    await codigo.fill('resultado = @ 2');
    const lexico = await analisar(page);
    await page.locator('.erros-lexicos').waitFor();
    assert.equal(lexico.estado_sintatico, 'nao_executado');
    assert.equal(await errosSintaticos.count(), 0);
    assert.match(await page.locator('.estado-sintatico').innerText(), /léxic/i);
    console.log('OK: combinação inválida e bloqueio da sintaxe diante de erro léxico');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.selectOption('#exemplos', 'condicional');
    await codigo.fill('if x > 0:\n    resultado = x * 2\nelse:\n    resultado = 0');
    const condicional = await analisar(page);
    await arvore.waitFor();
    assert.equal(condicional.ast.corpo[0].tipo, 'Se');
    assert.match(await tabela.innerText(), /INDENT/);
    const paginaCabeNaTela = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2);
    assert.ok(paginaCabeNaTela, 'a página deve caber na largura da tela de 390 px');
    await captura(page, 'ast-celular.png');
    console.log('OK: condicional e AST em tela de 390 px, sem transbordo ou erros JavaScript');

    const codigoNoLimite = 'x=1\n'.repeat(2500);
    await codigo.fill(codigoNoLimite);
    const extensa = await analisar(page);
    await arvore.waitFor();
    assert.equal(extensa.estado_sintatico, 'valido');
    assert.equal(extensa.ast.corpo.length, 2500);
    assert.equal(await arvore.locator('.ast-no').count(), 1, 'a árvore larga começa recolhida');
    await codigo.fill(codigoNoLimite + 'x');
    await page.locator('#btn-analisar').click();
    await page.getByText('O código excede o limite de 10000 caracteres.').waitFor();
    assert.deepEqual(erros, []);
    console.log('OK: entrada no limite é exibida e excesso recebe uma mensagem de validação');
  } finally {
    await browser.close();
  }
}

main().catch(erro => {
  console.error(erro);
  process.exitCode = 1;
});
