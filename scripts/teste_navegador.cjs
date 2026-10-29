/* Opcional: npm install --no-save playwright; npx playwright install chromium.
   BASE_URL=http://localhost:8080 node scripts/teste_navegador.cjs
   CHROMIUM_EXECUTABLE pode apontar para um Chrome já instalado. */
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath: process.env.CHROMIUM_EXECUTABLE} : {})});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}});
    const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.goto(process.env.BASE_URL || 'http://localhost:8080');
    await page.waitForSelector('#exemplos:not([disabled])');
    await page.selectOption('#exemplos', 'atribuicao');
    await page.click('#btn-analisar');
    await page.waitForSelector('.tabela-tokens tbody tr');
    assert.match(await page.locator('#resultados').innerText(), /IDENTIFICADOR/);
    assert.match(await page.locator('#resultados').innerText(), /LITERAL_REAL/);
    await page.getByRole('button', {name: 'Próximo', exact: true}).click();
    assert.match(await page.locator('.passo-atual').innerText(), /Token 2 de/);
    console.log('OK: exemplo, tabela e revisão de tokens no navegador');
    await page.locator('#codigo').fill('x = @ 2\nz = 123abc\na = 3');
    await page.click('#btn-analisar');
    await page.waitForSelector('.erros-lexicos');
    assert.match(await page.locator('.erros-lexicos').innerText(), /linha 1, coluna 5/);
    assert.match(await page.locator('.tabela-tokens').innerText(), /"a"/);
    assert.equal(await page.locator('.erros-lexicos li').count(), 2);
    console.log('OK: múltiplos erros localizados e recuperação dos tokens posteriores');
    await page.selectOption('#exemplos', 'erro-intencional');
    await page.click('#btn-analisar');
    await page.waitForSelector('.tabela-tokens');
    assert.equal(await page.locator('.erros-lexicos').count(), 0);
    console.log('OK: sintaxe inválida não é recusada pelo scanner');
    await page.screenshot({path: path.join('docs', 'demonstracao-desktop.png'), fullPage: true});
    await page.locator('#codigo').fill('');
    await page.click('#btn-analisar');
    assert.match(await page.locator('#resultados').innerText(), /Informe um código/);
    console.log('OK: validação de entrada vazia preservada');
    await page.setViewportSize({width: 390, height: 844});
    await page.selectOption('#exemplos', 'condicional');
    await page.click('#btn-analisar');
    await page.waitForSelector('.tabela-tokens');
    assert.match(await page.locator('#resultados').innerText(), /INDENT/);
    const dimensoes = await page.evaluate(() => ({pagina: document.documentElement.scrollWidth, tela: innerWidth}));
    assert.ok(dimensoes.pagina <= dimensoes.tela + 2, 'a página não deve transbordar horizontalmente no celular');
    await page.screenshot({path: path.join('docs', 'demonstracao-celular.png'), fullPage: true});
    assert.deepEqual(erros, []);
    console.log('OK: fluxo em tela de celular, sem erros JavaScript');
    console.log('5 verificações de navegador aprovadas.');
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exitCode = 1;});
