const test = require("node:test");
const assert = require("node:assert/strict");
const Logica = require("../js/logica.js");
const Resultados = require("../js/resultados.js");
const { criarControlador } = require("../js/controlador.js");

const tokens = [
  { tipo: "IDENTIFICADOR", lexema: "x", linha: 1, coluna: 1 },
  { tipo: "OPERADOR", lexema: "=", linha: 1, coluna: 3 },
  { tipo: "LITERAL_INTEIRO", lexema: "10", linha: 1, coluna: 5 },
];
class Elemento {
  constructor(tag) { this.tagName = tag; this.children = []; this.events = {}; this.className = ""; this._text = ""; }
  set textContent(t) { this._text = String(t); this.children = []; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(""); }
  appendChild(el) { this.children.push(el); return el; }
  addEventListener(name, fn) { this.events[name] = fn; }
  set innerHTML(_) { throw new Error("HTML de entrada nunca deve ser interpretado"); }
}
const documento = { createElement: (tag) => new Elemento(tag) };
function buscar(el, tag) { return (el.tagName === tag ? [el] : []).concat(el.children.flatMap((c) => buscar(c, tag))); }
function renderizar(dados) {
  const area = new Elemento("div");
  Resultados.mostrar(documento, area, dados);
  return area;
}

test("contrato léxico com sucesso preserva todos os tokens", () => {
  const r = Logica.interpretarResposta(200, { recebido: true, sucesso: true, tokens, erros: [], mensagem: "Análise concluída." });
  assert.equal(r.tipo, "sucesso");
  assert.deepEqual(r.tokens, tokens);
  assert.deepEqual(r.erros, []);
});
test("erro léxico HTTP200 é distinguido de sucesso de reconhecimento", () => {
  const erros = [{ tipo: "ERRO_LEXICO", lexema: "@", linha: 2, coluna: 4, mensagem: "Caractere não reconhecido: @" }];
  const r = Logica.interpretarResposta(200, { recebido: true, sucesso: false, tokens, erros });
  assert.equal(r.tipo, "erro_lexico"); assert.deepEqual(r.erros, erros);
  assert.match(r.mensagem, /erros léxicos/);
});
test("tabela exibe tipo, lexema e posições na ordem recebida", () => {
  const area = renderizar({ tokens, erros: [] });
  assert.deepEqual(buscar(area, "th").map((x) => x.textContent), ["Tipo", "Lexema", "Linha", "Coluna"]);
  const rows = buscar(area, "tbody")[0].children;
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[2].children.map((x) => x.textContent), ["LITERAL_INTEIRO", '"10"', "1", "5"]);
  assert.match(area.textContent, /IDENTIFICADOR: 1/);
});
test("revisão dos tokens avança, retorna e respeita os limites", () => {
  const area = renderizar({ tokens, erros: [] });
  const [anterior, proximo] = buscar(area, "button");
  assert.equal(anterior.disabled, true);
  proximo.events.click(); assert.match(area.textContent, /Token 2 de 3/);
  proximo.events.click(); assert.equal(proximo.disabled, true);
  proximo.events.click(); assert.match(area.textContent, /Token 3 de 3/);
  anterior.events.click(); assert.match(area.textContent, /Token 2 de 3/);
});
test("mensagem didática informa linha e coluna sem interpretar HTML", () => {
  const area = renderizar({ tokens: [], erros: [{ linha: 2, coluna: 3, mensagem: '<img src=x onerror="alert(1)"> fora do subconjunto' }] });
  assert.match(area.textContent, /Linha 2, coluna 3/);
  assert.match(area.textContent, /<img/);
  assert.equal(buscar(area, "img").length, 0);
});
test("comentários sem tokens e resposta antiga não quebram a apresentação", () => {
  assert.match(renderizar({ tokens: [], erros: [] }).textContent, /Nenhum token/);
  assert.equal(renderizar({ tipo: "info" }).textContent, "");
});
test("lexema de quebra de linha é visível e não vira linha vazia da tabela", () => {
  const area = renderizar({ tokens: [{ tipo: "NEWLINE", lexema: "\n", linha: 1, coluna: 7 }], erros: [] });
  assert.match(area.textContent, /"\\n"/);
});
test("controlador mantém código e encaminha tokens e erros ao renderizador", async () => {
  let resultado;
  const ui = { obterCodigo: () => "x = @", definirOcupado() {}, mostrarResultado(r) { resultado = r; } };
  const c = criarControlador({ ui, logica: Logica, fetchFn: async () => ({ status: 200, json: async () => ({ recebido: true, sucesso: false, tokens, erros: [{ linha: 1, coluna: 5, mensagem: "Caractere @ inválido" }] }) }) });
  await c.analisar();
  const area = renderizar(resultado);
  assert.equal(resultado.tipo, "erro_lexico");
  assert.match(area.textContent, /Caractere @ inválido/);
  assert.equal(buscar(area, "tbody")[0].children.length, 3);
});
