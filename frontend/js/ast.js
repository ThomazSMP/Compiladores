/* Árvore de sintaxe em listas com controles nativos de botão. */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica();
  else raiz.ArvoreSintatica = fabrica();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function rotulo(no) {
    switch (no.tipo) {
      case "Programa": return "Programa";
      case "Atribuicao": return "Atribuição";
      case "Nome": return "Nome " + no.identificador;
      case "Numero": return "Número " + no.lexema;
      case "Binaria": return "Operação binária " + no.operador;
      case "Unaria": return "Operação unária " + no.operador;
      case "Comparacao": return "Comparação " + no.operador;
      case "Se": return no.senao.length ? "Condicional if/else" : "Condicional if";
      default: return no.tipo;
    }
  }

  function filhosDe(no) {
    function comandos(lista, papel) {
      return (lista || []).map((comando, indice) => [papel + " " + (indice + 1), comando]);
    }
    switch (no.tipo) {
      case "Programa": return comandos(no.corpo, "Comando");
      case "Atribuicao": return [["Alvo", no.alvo], ["Valor", no.valor]];
      case "Binaria":
      case "Comparacao": return [["Esquerda", no.esquerda], ["Direita", no.direita]];
      case "Unaria": return [["Operando", no.operando]];
      case "Se": return [["Condição", no.condicao], ...comandos(no.entao, "Então"), ...comandos(no.senao, "Senão")];
      default: return [];
    }
  }

  function montar(criar, ast, selecionarNo) {
    const secao = criar("section", undefined, "arvore-ast");
    const titulo = criar("h3", "Árvore sintática abstrata (AST)");
    titulo.id = "titulo-ast";
    secao.setAttribute("aria-labelledby", titulo.id);
    secao.appendChild(titulo);
    secao.appendChild(criar("p", "Os tokens seguem a ordem do texto. A AST organiza esses elementos em comandos e expressões, omitindo detalhes como os parênteses. Selecione um nó para localizar o trecho no editor.", "explicacao"));

    if (!ast.corpo.length) {
      secao.appendChild(criar("p", "Programa sem comandos. Comentários não criam nós na árvore.", "explicacao"));
    }

    const posicao = criar("p", "Selecione um nó para ver sua posição.", "ast-posicao");
    const controles = criar("div", undefined, "passos");
    const expandir = criar("button", "Expandir tudo");
    const recolher = criar("button", "Recolher tudo");
    expandir.type = recolher.type = "button";
    controles.appendChild(expandir);
    controles.appendChild(recolher);
    secao.appendChild(controles);
    secao.appendChild(posicao);

    const rolagem = criar("div", undefined, "ast-rolagem");
    const raizes = criar("ul", undefined, "ast-lista ast-raiz");
    const ramos = [];
    let selecionado;

    function criarNo(no, papel, profundidade) {
      const item = criar("li");
      const linha = criar("div", undefined, "ast-linha");
      const tituloNo = (papel ? papel + " · " : "") + rotulo(no);
      const acao = criar("button", tituloNo, "ast-no");
      acao.type = "button";
      acao.setAttribute("aria-pressed", "false");
      acao.addEventListener("click", function () {
        if (selecionado) selecionado.setAttribute("aria-pressed", "false");
        selecionado = acao;
        acao.setAttribute("aria-pressed", "true");
        const estado = selecionarNo ? selecionarNo(no) : null;
        const origem = "Linha " + no.linha + ", coluna " + no.coluna +
                       " até linha " + no.linha_fim + ", coluna " + no.coluna_fim + " (fim exclusivo).";
        posicao.textContent = tituloNo + ". " + origem;
        if (estado === "codigo_alterado") {
          posicao.textContent += " O código mudou. Analise novamente para destacar este trecho.";
        } else if (estado === "posicao_indisponivel") {
          posicao.textContent += " Não foi possível destacar este trecho.";
        }
      });

      const filhos = filhosDe(no);
      if (filhos.length > 0) {
        const alternar = criar("button", "+", "ast-alternar");
        const lista = criar("ul", undefined, "ast-lista ast-filhos");
        alternar.type = "button";
        lista.id = "ast-ramo-" + (ramos.length + 1);
        alternar.setAttribute("aria-controls", lista.id);
        lista.hidden = true;
        let montado = false;

        function definirAberto(aberto) {
          if (aberto && !montado) {
            for (const [relacao, filho] of filhos) {
              lista.appendChild(criarNo(filho, relacao, profundidade + 1));
            }
            montado = true;
          }
          lista.hidden = !aberto;
          alternar.textContent = aberto ? "−" : "+";
          alternar.setAttribute("aria-expanded", String(aberto));
          alternar.setAttribute("aria-label", (aberto ? "Recolher " : "Expandir ") + tituloNo);
        }
        definirAberto(false);
        alternar.addEventListener("click", function () { definirAberto(lista.hidden); });
        ramos.push({ definirAberto: definirAberto, profundidade: profundidade, largura: filhos.length });
        linha.appendChild(alternar);
        item.appendChild(linha);
        item.appendChild(lista);
      } else {
        item.appendChild(linha);
      }
      linha.appendChild(acao);
      return item;
    }

    raizes.appendChild(criarNo(ast, "", 0));
    // Iterar sobre a lista percorre também os ramos inseridos durante a abertura.
    for (const ramo of ramos) {
      if (ramo.profundidade < 3 && ramo.largura <= 8) ramo.definirAberto(true);
    }
    expandir.disabled = recolher.disabled = ramos.length === 0;
    expandir.addEventListener("click", function () {
      for (const ramo of ramos) ramo.definirAberto(true);
    });
    recolher.addEventListener("click", function () {
      for (const ramo of ramos) ramo.definirAberto(false);
    });
    rolagem.appendChild(raizes);
    secao.appendChild(rolagem);
    return secao;
  }

  return { montar: montar };
});
