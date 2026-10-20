/* Testes de interface sobre o HTML/CSS entregue: os elementos exigidos existem e estão ligados. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(raiz, "index.html"), "utf8");
const css = fs.readFileSync(path.join(raiz, "style.css"), "utf8");

const temId = (id) => new RegExp(`id="${id}"`).test(html);

test("identifica o sistema e a linguagem analisada", () => {
  assert.ok(temId("nome-sistema"));
  assert.match(html, /<h1 id="nome-sistema">[^<]*Software Educacional[^<]*<\/h1>/);
  assert.match(html, /id="linguagem"[^>]*>[\s\S]*Python/);
});

test("possui área de código, seletor de exemplos, botão de análise e área de resultados", () => {
  for (const id of ["codigo", "exemplos", "btn-analisar", "resultados"]) {
    assert.ok(temId(id), `falta o elemento #${id}`);
  }
  assert.match(html, /<textarea[^>]*id="codigo"/);
  assert.match(html, /<select[^>]*id="exemplos"/);
  assert.match(html, /<button[^>]*id="btn-analisar"[^>]*>\s*Analisar código\s*<\/button>/);
});

test("os campos têm rótulos associados", () => {
  assert.match(html, /<label for="codigo">/);
  assert.match(html, /<label for="exemplos">/);
});

test("a área de resultados é anunciada para leitores de tela", () => {
  assert.match(html, /id="resultados"[^>]*aria-live="polite"/);
});

test("a área de código usa fonte monoespaçada e desliga a correção ortográfica", () => {
  assert.match(css, /textarea\s*\{[^}]*monospace/);
  assert.match(html, /<textarea[^>]*spellcheck="false"/);
});

test("há um código inicial que o usuário pode substituir", () => {
  assert.match(html, /<textarea[^>]*>\s*\S[\s\S]*<\/textarea>/);
});

test("os scripts são carregados na ordem correta", () => {
  const posicoes = ["js/logica.js", "js/controlador.js", "js/app.js"].map((s) => html.indexOf(s));
  assert.ok(posicoes.every((p) => p > -1), "script ausente");
  assert.deepEqual([...posicoes].sort((a, b) => a - b), posicoes);
});

test("todos os arquivos referenciados pelo HTML existem", () => {
  for (const ref of ["style.css", "js/logica.js", "js/controlador.js", "js/app.js"]) {
    assert.ok(fs.existsSync(path.join(raiz, ref)), `${ref} não existe`);
  }
});

test("a página não mostra mais a mensagem fixa da etapa 1", () => {
  assert.ok(!/Hello, World!/.test(html));
});
