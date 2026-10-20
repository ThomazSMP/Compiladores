const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logica.js");

test("validarEntrada aceita código válido", () => {
  assert.deepEqual(L.validarEntrada("x = 10"), { valido: true });
});

test("validarEntrada rejeita texto vazio com a mensagem esperada", () => {
  const r = L.validarEntrada("");
  assert.equal(r.valido, false);
  assert.equal(r.tipo, "entrada_vazia");
  assert.equal(r.mensagem, "Informe um código-fonte antes de solicitar a análise.");
});

test("validarEntrada rejeita entrada só com espaços, tabs e quebras de linha", () => {
  for (const texto of ["   ", "\n\n", "\t \r\n", "\u00a0"]) {
    assert.equal(L.validarEntrada(texto).valido, false, JSON.stringify(texto));
  }
});

test("validarEntrada rejeita valores que não são texto", () => {
  for (const valor of [null, undefined, 10, {}, []]) {
    assert.equal(L.validarEntrada(valor).tipo, "entrada_vazia");
  }
});

test("validarEntrada aceita caracteres especiais e código com erro de sintaxe", () => {
  assert.equal(L.validarEntrada("t = 'ação ✓ 日本' # $ % & < > \" \\").valido, true);
  assert.equal(L.validarEntrada("x = = 5 +\nif :").valido, true);
});

test("validarEntrada respeita o limite de tamanho", () => {
  assert.equal(L.validarEntrada("a".repeat(L.TAMANHO_MAXIMO)).valido, true);
  const r = L.validarEntrada("a".repeat(L.TAMANHO_MAXIMO + 1));
  assert.equal(r.valido, false);
  assert.equal(r.tipo, "entrada_muito_grande");
});

test("montarRequisicao gera POST com JSON {codigo}", () => {
  const codigo = 'x = "olá"\nif x:\n    y = 1';
  const req = L.montarRequisicao(codigo);
  assert.equal(req.method, "POST");
  assert.equal(req.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(req.body), { codigo });
});

test("interpretarResposta: sucesso (200)", () => {
  const r = L.interpretarResposta(200, {
    recebido: true, mensagem: "Código recebido com sucesso.", resumo: { linhas: 2, caracteres: 9 },
  });
  assert.equal(r.tipo, "sucesso");
  assert.equal(r.mensagem, "Código recebido com sucesso.");
  assert.deepEqual(r.detalhes, { linhas: 2, caracteres: 9 });
});

test("interpretarResposta: erros de entrada (400) usam a mensagem do backend", () => {
  const corpo = { recebido: false, erro: { tipo: "entrada_vazia", mensagem: "Informe um código-fonte antes de solicitar a análise." } };
  const r = L.interpretarResposta(400, corpo);
  assert.equal(r.tipo, "erro_entrada");
  assert.equal(r.mensagem, corpo.erro.mensagem);
});

test("interpretarResposta: 413 também é erro de entrada", () => {
  const corpo = { recebido: false, erro: { tipo: "entrada_muito_grande", mensagem: "Grande demais." } };
  assert.equal(L.interpretarResposta(413, corpo).tipo, "erro_entrada");
});

test("interpretarResposta: 500 com JSON do backend é erro de servidor", () => {
  const corpo = { recebido: false, erro: { tipo: "erro_interno", mensagem: "Ocorreu um erro inesperado." } };
  const r = L.interpretarResposta(500, corpo);
  assert.equal(r.tipo, "erro_servidor");
  assert.equal(r.mensagem, "Ocorreu um erro inesperado.");
});

test("interpretarResposta: 502/503/504 ou corpo ilegível indicam falha de comunicação", () => {
  for (const status of [502, 503, 504]) {
    assert.equal(L.interpretarResposta(status, null).tipo, "erro_comunicacao");
  }
  assert.equal(L.interpretarResposta(200, null).tipo, "erro_comunicacao");
  assert.equal(L.interpretarResposta(502, null).mensagem, L.MENSAGENS.comunicacao);
});

test("interpretarResposta: formato inesperado vira mensagem genérica sem vazar detalhes", () => {
  const r = L.interpretarResposta(500, { detail: "Traceback (most recent call last) /app/main.py" });
  assert.equal(r.tipo, "erro_servidor");
  assert.equal(r.mensagem, L.MENSAGENS.erroInesperado);
  assert.ok(!r.mensagem.includes("Traceback"));
});
