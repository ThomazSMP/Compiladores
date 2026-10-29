/* Apresentação de tokens. Todo conteúdo vindo do programa usa textContent. */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica();
  else raiz.Resultados = fabrica();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function mostrar(documento, area, resultado) {
    function criar(tag, texto, classe) {
      const el = documento.createElement(tag);
      if (texto !== undefined) el.textContent = texto;
      if (classe) el.className = classe;
      return el;
    }
    if (resultado.erros && resultado.erros.length) {
      area.appendChild(criar("h3", "Erros léxicos (" + resultado.erros.length + ")"));
      const lista = criar("ul", undefined, "erros-lexicos");
      resultado.erros.forEach(function (erro) {
        lista.appendChild(criar("li", "Linha " + erro.linha + ", coluna " + erro.coluna + ": " + erro.mensagem));
      });
      area.appendChild(lista);
    }
    if (!Array.isArray(resultado.tokens)) return;
    const tokens = resultado.tokens;
    area.appendChild(criar("h3", "Tokens reconhecidos (" + tokens.length + ")"));
    area.appendChild(criar("p", "Token é a categoria reconhecida; lexema é o trecho do código. Linha e coluna começam em 1. NEWLINE, INDENT e DEDENT representam quebras de linha e mudanças de indentação.", "explicacao"));
    const contagens = Object.create(null);
    tokens.forEach(function (t) { contagens[t.tipo] = (contagens[t.tipo] || 0) + 1; });
    area.appendChild(criar("p", Object.keys(contagens).map(function (k) { return k + ": " + contagens[k]; }).join(" · "), "contagens"));
    if (!tokens.length) {
      area.appendChild(criar("p", "Nenhum token: comentários e espaços são ignorados."));
      return;
    }
    const controles = criar("div", undefined, "passos");
    const anterior = criar("button", "Anterior");
    const proximo = criar("button", "Próximo");
    anterior.type = proximo.type = "button";
    const passo = criar("p", undefined, "passo-atual");
    controles.appendChild(anterior); controles.appendChild(proximo);
    area.appendChild(criar("p", "Revisão da sequência: avance ou retorne um token por vez. Este controle percorre o resultado do scanner; não valida a sintaxe.", "explicacao"));
    area.appendChild(controles); area.appendChild(passo);
    const rolagem = criar("div", undefined, "tabela-rolagem");
    rolagem.tabIndex = 0;
    const tabela = criar("table", undefined, "tabela-tokens");
    tabela.appendChild(criar("caption", "Sequência de tokens na ordem do código"));
    const cabecalho = criar("thead"); const titulos = criar("tr");
    ["Tipo", "Lexema", "Linha", "Coluna"].forEach(function (titulo) {
      const th = criar("th", titulo); th.scope = "col"; titulos.appendChild(th);
    });
    cabecalho.appendChild(titulos); tabela.appendChild(cabecalho);
    const corpo = criar("tbody"); const linhas = [];
    tokens.forEach(function (token) {
      const linha = criar("tr");
      [token.tipo, JSON.stringify(token.lexema), token.linha, token.coluna].forEach(function (valor) {
        linha.appendChild(criar("td", String(valor)));
      });
      linhas.push(linha); corpo.appendChild(linha);
    });
    tabela.appendChild(corpo); rolagem.appendChild(tabela); area.appendChild(rolagem);
    let indice = 0;
    function atualizar() {
      linhas.forEach(function (linha, i) { linha.className = i === indice ? "token-ativo" : ""; });
      const token = tokens[indice];
      passo.textContent = "Token " + (indice + 1) + " de " + tokens.length + ": " + token.tipo + " — " + JSON.stringify(token.lexema) + " (linha " + token.linha + ", coluna " + token.coluna + ")";
      anterior.disabled = indice === 0; proximo.disabled = indice === tokens.length - 1;
    }
    anterior.addEventListener("click", function () { if (indice > 0) { indice -= 1; atualizar(); } });
    proximo.addEventListener("click", function () { if (indice < tokens.length - 1) { indice += 1; atualizar(); } });
    atualizar();
  }
  return { mostrar: mostrar };
});
