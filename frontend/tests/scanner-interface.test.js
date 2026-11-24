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
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.events = {};
    this.attributes = {};
    this.className = "";
    this._text = "";
  }
  set textContent(t) { this._text = String(t); this.children = []; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(""); }
  appendChild(el) { this.children.push(el); return el; }
  addEventListener(name, fn) { this.events[name] = fn; }
  setAttribute(name, value) { this.attributes[name] = value; }
  set innerHTML(_) { throw new Error("HTML de entrada nunca deve ser interpretado"); }
}
const documento = { createElement: (tag) => new Elemento(tag) };
function buscar(el, tag) { return (el.tagName === tag ? [el] : []).concat(el.children.flatMap((c) => buscar(c, tag))); }
function renderizar(dados, selecionarNo) {
  const area = new Elemento("div");
  Resultados.mostrar(documento, area, dados, selecionarNo);
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

const codigoPrecedencia = "r = 10 + 5 * 2";
const astPrecedencia = {
  tipo: "Programa", corpo: [{
    tipo: "Atribuicao",
    alvo: { tipo: "Nome", identificador: "r" },
    valor: { tipo: "Binaria", operador: "+",
      esquerda: { tipo: "Numero", lexema: "10" },
      direita: { tipo: "Binaria", operador: "*",
        linha: 1, coluna: 10, linha_fim: 1, coluna_fim: 15,
        esquerda: { tipo: "Numero", lexema: "5" },
        direita: { tipo: "Numero", lexema: "2" } } },
  }],
};

function respostaSintatica(estado, campos) {
  return Logica.interpretarResposta(200, {
    recebido: true, sucesso: true, estado_sintatico: estado, tokens, erros: [],
    ast: null, erros_sintaticos: [], ...campos,
  });
}

test("AST de precedência preserva a hierarquia, a seleção e a tabela de tokens", () => {
  let trechoSelecionado;
  const resultado = respostaSintatica("valido", { ast: astPrecedencia });
  const area = renderizar(resultado, (no) => {
    trechoSelecionado = codigoPrecedencia.slice(...Logica.intervaloNoCodigo(codigoPrecedencia, no));
    return "selecionado";
  });
  const lista = buscar(area, "section")[0];
  const multiplicacao = buscar(lista, "button").find((botao) => botao.textContent === "Direita · Operação binária *");
  const soma = buscar(lista, "li").find((item) => item.children[0].textContent.includes("Valor · Operação binária +"));
  assert.match(area.textContent, /Árvore sintática abstrata/);
  assert.ok(multiplicacao);
  assert.ok(buscar(soma, "button").includes(multiplicacao));
  assert.equal(buscar(area, "tbody")[0].children.length, tokens.length);
  multiplicacao.events.click();
  assert.equal(trechoSelecionado, "5 * 2");
  assert.equal(multiplicacao.attributes["aria-pressed"], "true");
  assert.match(lista.textContent, /Linha 1, coluna 10 até linha 1, coluna 15/);
});

test("há raízes recolhidas ao iniciar árvores largas e os controles podem abrir tudo", () => {
  const ast = { tipo: "Programa", corpo: Array.from({ length: 1000 }, () => ({
    tipo: "Atribuicao", alvo: { tipo: "Nome", identificador: "x" }, valor: { tipo: "Numero", lexema: "7" },
  })) };
  const area = renderizar(respostaSintatica("valido", { ast }));
  const lista = buscar(area, "section")[0];
  const [expandir, recolher, raiz] = buscar(lista, "button");
  const filhos = buscar(lista, "ul")[1];
  assert.equal(raiz.attributes["aria-expanded"], "false");
  assert.equal(filhos.children.length, 0);
  expandir.events.click();
  assert.equal(raiz.attributes["aria-expanded"], "true");
  assert.equal(filhos.hidden, false);
  assert.equal(filhos.children.length, 1000);
  recolher.events.click();
  assert.equal(filhos.hidden, true);
  assert.equal(raiz.attributes["aria-expanded"], "false");
});

test("comentários produzem uma AST de programa vazio e mantêm o status léxico", () => {
  const area = renderizar(respostaSintatica("valido", { ast: { tipo: "Programa", corpo: [] }, tokens: [] }));
  assert.match(area.textContent, /Programa sem comandos/);
  assert.match(area.textContent, /Nenhum token/);
});

test("AST de if/else distingue a condição e os comandos de cada ramo", () => {
  function atribuicao(nome, lexema) {
    return { tipo: "Atribuicao", alvo: { tipo: "Nome", identificador: nome }, valor: { tipo: "Numero", lexema } };
  }
  const ast = { tipo: "Programa", corpo: [{
    tipo: "Se",
    condicao: { tipo: "Comparacao", operador: ">", esquerda: { tipo: "Nome", identificador: "x" },
      direita: { tipo: "Numero", lexema: "0" } },
    entao: [atribuicao("x", "1")], senao: [atribuicao("x", "2")],
  }] };
  const area = renderizar(respostaSintatica("valido", { ast }));
  const no = buscar(area, "li").find((item) => item.children[0].textContent.includes("Condicional if/else"));
  const papeis = no.children[1].children.map((item) => buscar(item.children[0], "button").at(-1).textContent);
  assert.deepEqual(papeis, ["Condição · Comparação >", "Então 1 · Atribuição", "Senão 1 · Atribuição"]);
});

test("erro sintático HTTP 200 preserva os tokens e exibe encontrado, esperado e posição", () => {
  const resultado = respostaSintatica("invalido", {
    erros_sintaticos: [{ linha: 1, coluna: 8, regra: "primaria",
      mensagem: "Erro sintático na linha 1, coluna 8: feche a expressão com ')'. Encontrado: o fim do código (EOF).",
      esperado: ")", encontrado: "EOF" }],
  });
  const area = renderizar(resultado);
  assert.equal(resultado.tipo, "erro_sintatico");
  assert.match(area.textContent, /Erros sintáticos/);
  assert.match(area.textContent, /linha 1, coluna 8: feche a expressão/);
  assert.match(area.textContent, /Encontrado: o fim do código \(EOF\)/);
  assert.match(area.textContent, /Regra primaria · Esperado: \)/);
  assert.equal(buscar(area, "tbody")[0].children.length, tokens.length);
  assert.equal(buscar(area, "section").length, 0);
});

test("erro léxico deixa explícito que o parser foi ignorado", () => {
  const resultado = respostaSintatica("nao_executado", {
    sucesso: false, erros: [{ linha: 1, coluna: 5, mensagem: "Caractere @ inválido" }],
  });
  const area = renderizar(resultado);
  assert.match(area.textContent, /Análise sintática não executada/);
  assert.doesNotMatch(area.textContent, /Erros sintáticos/);
  assert.equal(buscar(area, "section").length, 0);
});

test("selecionar nó após editar o código pede uma nova análise", () => {
  const area = renderizar(respostaSintatica("valido", { ast: astPrecedencia }), () => "codigo_alterado");
  const multiplicacao = buscar(area, "button").find((botao) => botao.textContent === "Direita · Operação binária *");
  multiplicacao.events.click();
  assert.match(area.textContent, /O código mudou. Analise novamente/);
});

test("intervalos de origem usam o fim exclusivo, mesmo após Unicode e CRLF", () => {
  const codigo = "# ✨ 🧪\r\nx = (2\r\n     + 3)";
  const posicao = { linha: 2, coluna: 5, linha_fim: 3, coluna_fim: 10 };
  assert.equal(codigo.slice(...Logica.intervaloNoCodigo(codigo, posicao)), "(2\r\n     + 3)");
  assert.equal(Logica.intervaloNoCodigo(codigo, { ...posicao, coluna: 99 }), null);
  assert.deepEqual(Logica.intervaloNoCodigo("# 🧪x", { linha: 1, coluna: 4, linha_fim: 1, coluna_fim: 5 }), [4, 5]);
});
