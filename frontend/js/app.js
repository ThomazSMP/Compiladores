/* Ligação entre o HTML e o controlador (única parte que usa o DOM). */
(function () {
  "use strict";

  const campoCodigo = document.getElementById("codigo");
  const seletor = document.getElementById("exemplos");
  const botao = document.getElementById("btn-analisar");
  const area = document.getElementById("resultados");

  function paragrafo(texto, classe) {
    const p = document.createElement("p");
    p.textContent = texto; // textContent: nunca interpreta o conteúdo como HTML
    if (classe) p.className = classe;
    return p;
  }

  const ui = {
    obterCodigo: function () { return campoCodigo.value; },
    definirCodigo: function (texto) { campoCodigo.value = texto; campoCodigo.focus(); },
    definirOcupado: function (ocupado) {
      botao.disabled = ocupado;
      botao.textContent = ocupado ? "Analisando…" : "Analisar código";
    },
    mostrarExemplos: function (lista) {
      seletor.textContent = "";
      const inicial = document.createElement("option");
      inicial.value = "";
      inicial.textContent = lista.length ? "Selecione um exemplo…" : "Exemplos indisponíveis";
      seletor.appendChild(inicial);
      lista.forEach(function (exemplo) {
        const opcao = document.createElement("option");
        opcao.value = exemplo.id;
        opcao.textContent = exemplo.titulo;
        seletor.appendChild(opcao);
      });
      seletor.disabled = lista.length === 0;
    },
    mostrarResultado: function (resultado) {
      area.className = "resultados resultados--" + resultado.tipo;
      area.textContent = "";
      area.appendChild(paragrafo(resultado.mensagem));
      if (resultado.detalhes) {
        area.appendChild(paragrafo(
          "Linhas: " + resultado.detalhes.linhas + " · Caracteres: " + resultado.detalhes.caracteres,
          "detalhes"
        ));
      }
      window.Resultados.mostrar(document, area, resultado);
    },
  };

  const controlador = window.Controlador.criarControlador({
    ui: ui,
    fetchFn: function () { return window.fetch.apply(window, arguments); },
    logica: window.Logica,
  });

  botao.addEventListener("click", function () { controlador.analisar(); });

  seletor.addEventListener("change", function () {
    if (controlador.selecionarExemplo(seletor.value)) {
      seletor.value = ""; // permite escolher o mesmo exemplo de novo para restaurá-lo
    }
  });

  campoCodigo.addEventListener("keydown", function (evento) {
    if ((evento.ctrlKey || evento.metaKey) && evento.key === "Enter") {
      evento.preventDefault();
      controlador.analisar();
    }
  });

  controlador.carregarExemplos();
})();
