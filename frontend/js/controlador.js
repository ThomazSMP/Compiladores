/* Controlador da tela: coordena validação, chamadas ao backend e exibição de mensagens.
   Não toca no DOM: recebe um objeto `ui` (implementado em app.js) e uma função `fetchFn`,
   o que permite testá-lo com dublês. */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) {
    module.exports = fabrica();
  } else {
    raiz.Controlador = fabrica();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function criarControlador(deps) {
    const ui = deps.ui;
    const fetchFn = deps.fetchFn;
    const logica = deps.logica;

    let exemplos = [];
    let ocupado = false;

    async function carregarExemplos() {
      try {
        const resposta = await fetchFn("/api/exemplos");
        if (!resposta.ok) throw new Error("HTTP " + resposta.status);
        const corpo = await resposta.json();
        exemplos = Array.isArray(corpo.exemplos) ? corpo.exemplos : [];
        ui.mostrarExemplos(exemplos);
      } catch (erro) {
        exemplos = [];
        ui.mostrarExemplos([]);
        ui.mostrarResultado({ tipo: "aviso", mensagem: logica.MENSAGENS.exemplosIndisponiveis });
      }
    }

    function selecionarExemplo(id) {
      const exemplo = exemplos.find(function (e) { return e.id === id; });
      if (!exemplo) return false;
      ui.definirCodigo(exemplo.codigo);
      ui.mostrarResultado({
        tipo: "info",
        mensagem: 'Exemplo "' + exemplo.titulo + '" carregado. ' + exemplo.descricao +
                  " Você pode editá-lo antes de analisar.",
      });
      return true;
    }

    async function analisar() {
      if (ocupado) return;
      const codigo = ui.obterCodigo();
      const validacao = logica.validarEntrada(codigo);
      if (!validacao.valido) {
        ui.mostrarResultado({ tipo: "erro_entrada", mensagem: validacao.mensagem });
        return;
      }

      ocupado = true;
      ui.definirOcupado(true);
      try {
        const resposta = await fetchFn("/api/analisar", logica.montarRequisicao(codigo));
        let corpo = null;
        try {
          corpo = await resposta.json();
        } catch (erroJson) {
          corpo = null; // por exemplo, página de erro HTML do Nginx
        }
        ui.mostrarResultado(logica.interpretarResposta(resposta.status, corpo));
      } catch (erroRede) {
        ui.mostrarResultado({ tipo: "erro_comunicacao", mensagem: logica.MENSAGENS.comunicacao });
      } finally {
        ocupado = false;
        ui.definirOcupado(false);
      }
    }

    return { carregarExemplos: carregarExemplos, selecionarExemplo: selecionarExemplo, analisar: analisar };
  }

  return { criarControlador: criarControlador };
});
