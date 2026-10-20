const test = require("node:test");
const assert = require("node:assert/strict");
const Logica = require("../js/logica.js");
const { criarControlador } = require("../js/controlador.js");

const EXEMPLOS = [
  { id: "atribuicao", titulo: "Atribuição", descricao: "Variáveis.", codigo: "x = 10\ny = 2.5\n" },
  { id: "condicional", titulo: "Condicional", descricao: "if/else.", codigo: "if x > 0:\n    x = 1\n" },
  { id: "aritmetica", titulo: "Aritmética", descricao: "Contas.", codigo: "r = (1 + 2) * 3\n" },
];

function resposta(status, corpo) {
  return { status, ok: status >= 200 && status < 300, json: async () => { if (corpo === undefined) throw new SyntaxError("não é JSON"); return corpo; } };
}

/* Dublê da interface: registra tudo o que o controlador pede para exibir. */
function criarUiFalsa(codigoInicial) {
  const ui = {
    codigo: codigoInicial === undefined ? "x = 10" : codigoInicial,
    resultados: [], ocupado: [], exemplosMostrados: null,
    obterCodigo() { return this.codigo; },
    definirCodigo(t) { this.codigo = t; },
    definirOcupado(b) { this.ocupado.push(b); },
    mostrarExemplos(l) { this.exemplosMostrados = l; },
    mostrarResultado(r) { this.resultados.push(r); },
    ultimo() { return this.resultados[this.resultados.length - 1]; },
  };
  return ui;
}

function montar(roteador, codigoInicial) {
  const ui = criarUiFalsa(codigoInicial);
  const chamadas = [];
  const fetchFn = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    return roteador(url, opcoes);
  };
  const controlador = criarControlador({ ui, fetchFn, logica: Logica });
  return { ui, chamadas, controlador };
}

const backendOk = async (url) => {
  if (url === "/api/exemplos") return resposta(200, { exemplos: EXEMPLOS });
  return resposta(200, { recebido: true, mensagem: "Código recebido com sucesso.", resumo: { linhas: 1, caracteres: 6 } });
};

// ---------- exemplos ----------
test("carregarExemplos busca /api/exemplos e entrega a lista à interface", async () => {
  const { ui, chamadas, controlador } = montar(backendOk);
  await controlador.carregarExemplos();
  assert.equal(chamadas[0].url, "/api/exemplos");
  assert.deepEqual(ui.exemplosMostrados, EXEMPLOS);
});

test("carregarExemplos: falha de rede avisa o usuário sem quebrar", async () => {
  const { ui, controlador } = montar(async () => { throw new TypeError("Failed to fetch"); });
  await controlador.carregarExemplos();
  assert.deepEqual(ui.exemplosMostrados, []);
  assert.equal(ui.ultimo().tipo, "aviso");
  assert.equal(ui.ultimo().mensagem, Logica.MENSAGENS.exemplosIndisponiveis);
});

test("carregarExemplos: resposta HTTP de erro também avisa o usuário", async () => {
  const { ui, controlador } = montar(async () => resposta(502, undefined));
  await controlador.carregarExemplos();
  assert.equal(ui.ultimo().tipo, "aviso");
});

for (const exemplo of EXEMPLOS) {
  test(`selecionar o exemplo "${exemplo.id}" preenche a área de código`, async () => {
    const { ui, controlador } = montar(backendOk);
    await controlador.carregarExemplos();
    assert.equal(controlador.selecionarExemplo(exemplo.id), true);
    assert.equal(ui.codigo, exemplo.codigo);
    assert.equal(ui.ultimo().tipo, "info");
  });
}

test("escolher outro exemplo substitui o conteúdo anterior", async () => {
  const { ui, controlador } = montar(backendOk);
  await controlador.carregarExemplos();
  controlador.selecionarExemplo("atribuicao");
  controlador.selecionarExemplo("condicional");
  assert.equal(ui.codigo, EXEMPLOS[1].codigo);
});

test("exemplo inexistente ou vazio não altera o código", async () => {
  const { ui, controlador } = montar(backendOk);
  await controlador.carregarExemplos();
  assert.equal(controlador.selecionarExemplo("nao-existe"), false);
  assert.equal(controlador.selecionarExemplo(""), false);
  assert.equal(ui.codigo, "x = 10");
});

test("o exemplo carregado pode ser editado antes de analisar", async () => {
  const { ui, chamadas, controlador } = montar(backendOk);
  await controlador.carregarExemplos();
  controlador.selecionarExemplo("atribuicao");
  ui.codigo = ui.codigo + "z = 3\n";
  await controlador.analisar();
  const envio = chamadas.find((c) => c.url === "/api/analisar");
  assert.deepEqual(JSON.parse(envio.opcoes.body), { codigo: "x = 10\ny = 2.5\nz = 3\n" });
});

// ---------- envio e resultados ----------
test("analisar envia o código por POST em JSON e mostra o sucesso", async () => {
  const { ui, chamadas, controlador } = montar(backendOk, "a = 1\nb = 2");
  await controlador.analisar();
  assert.equal(chamadas.length, 1);
  assert.equal(chamadas[0].url, "/api/analisar");
  assert.equal(chamadas[0].opcoes.method, "POST");
  assert.deepEqual(JSON.parse(chamadas[0].opcoes.body), { codigo: "a = 1\nb = 2" });
  assert.equal(ui.ultimo().tipo, "sucesso");
  assert.deepEqual(ui.ultimo().detalhes, { linhas: 1, caracteres: 6 });
});

test("o código digitado é preservado depois da análise", async () => {
  const { ui, controlador } = montar(backendOk, "x = 1");
  await controlador.analisar();
  assert.equal(ui.codigo, "x = 1");
});

test("entrada vazia não chama o backend e mostra a mensagem de orientação", async () => {
  const { ui, chamadas, controlador } = montar(backendOk, "");
  await controlador.analisar();
  assert.equal(chamadas.length, 0);
  assert.equal(ui.ultimo().tipo, "erro_entrada");
  assert.equal(ui.ultimo().mensagem, "Informe um código-fonte antes de solicitar a análise.");
});

test("entrada só com espaços não chama o backend", async () => {
  const { ui, chamadas, controlador } = montar(backendOk, "  \n\t  ");
  await controlador.analisar();
  assert.equal(chamadas.length, 0);
  assert.equal(ui.ultimo().tipo, "erro_entrada");
});

test("caracteres especiais são enviados sem alteração", async () => {
  const codigo = "t = 'ação ✓ 日本' # $ % & < > \" \\";
  const { chamadas, controlador } = montar(backendOk, codigo);
  await controlador.analisar();
  assert.equal(JSON.parse(chamadas[0].opcoes.body).codigo, codigo);
});

test("código com erro de sintaxe é enviado normalmente", async () => {
  const { chamadas, controlador } = montar(backendOk, "x = = 5 +");
  await controlador.analisar();
  assert.equal(chamadas.length, 1);
});

test("erro de validação do backend (400) é exibido como erro de entrada", async () => {
  const corpo = { recebido: false, erro: { tipo: "entrada_vazia", mensagem: "Informe um código-fonte antes de solicitar a análise." } };
  const { ui, controlador } = montar(async () => resposta(400, corpo));
  await controlador.analisar();
  assert.equal(ui.ultimo().tipo, "erro_entrada");
  assert.equal(ui.ultimo().mensagem, corpo.erro.mensagem);
});

// ---------- falhas ----------
test("falha de rede mostra a mensagem de comunicação e deixa a interface utilizável", async () => {
  const { ui, controlador } = montar(async () => { throw new TypeError("Failed to fetch"); });
  await controlador.analisar();
  assert.equal(ui.ultimo().tipo, "erro_comunicacao");
  assert.equal(ui.ultimo().mensagem, "Não foi possível comunicar com o servidor. Verifique a conexão e tente novamente.");
  assert.deepEqual(ui.ocupado, [true, false]);
  assert.equal(ui.codigo, "x = 10");
});

test("página HTML de erro (502 do Nginx) vira falha de comunicação", async () => {
  const { ui, controlador } = montar(async () => resposta(502, undefined));
  await controlador.analisar();
  assert.equal(ui.ultimo().tipo, "erro_comunicacao");
});

test("erro 500 do backend mostra mensagem genérica", async () => {
  const corpo = { recebido: false, erro: { tipo: "erro_interno", mensagem: "Ocorreu um erro inesperado ao processar o código. Tente novamente em instantes." } };
  const { ui, controlador } = montar(async () => resposta(500, corpo));
  await controlador.analisar();
  assert.equal(ui.ultimo().tipo, "erro_servidor");
  assert.ok(!/Traceback|\/app\//.test(ui.ultimo().mensagem));
});

test("a interface é reabilitada depois de qualquer resultado", async () => {
  const { ui, controlador } = montar(backendOk);
  await controlador.analisar();
  assert.deepEqual(ui.ocupado, [true, false]);
});

test("cliques repetidos durante o envio não geram requisições duplicadas", async () => {
  let liberar;
  const travado = new Promise((r) => { liberar = r; });
  const { chamadas, controlador } = montar(async () => { await travado; return resposta(200, { recebido: true, mensagem: "ok" }); });
  const primeira = controlador.analisar();
  const segunda = controlador.analisar();
  liberar();
  await Promise.all([primeira, segunda]);
  assert.equal(chamadas.length, 1);
});

test("depois de uma falha, uma nova tentativa funciona", async () => {
  let tentativas = 0;
  const { ui, controlador } = montar(async () => {
    tentativas += 1;
    if (tentativas === 1) throw new TypeError("Failed to fetch");
    return resposta(200, { recebido: true, mensagem: "Código recebido com sucesso." });
  });
  await controlador.analisar();
  assert.equal(ui.ultimo().tipo, "erro_comunicacao");
  await controlador.analisar();
  assert.equal(ui.ultimo().tipo, "sucesso");
});
