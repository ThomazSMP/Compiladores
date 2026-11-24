/* Regras puras do frontend: validação, montagem da requisição e interpretação da resposta.
   Funciona no navegador (window.Logica) e no Node (require), o que permite testá-la sem navegador. */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) {
    module.exports = fabrica();
  } else {
    raiz.Logica = fabrica();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const TAMANHO_MAXIMO = 10000;

  const MENSAGENS = {
    entradaVazia: "Informe um código-fonte antes de solicitar a análise.",
    entradaGrande: "O código excede o limite de " + TAMANHO_MAXIMO + " caracteres.",
    comunicacao: "Não foi possível comunicar com o servidor. Verifique a conexão e tente novamente.",
    erroInesperado: "Ocorreu um erro inesperado. Tente novamente em instantes.",
    exemplosIndisponiveis: "Não foi possível carregar os exemplos. Você ainda pode digitar o código manualmente.",
  };

  function validarEntrada(codigo) {
    if (typeof codigo !== "string" || codigo.trim() === "") {
      return { valido: false, tipo: "entrada_vazia", mensagem: MENSAGENS.entradaVazia };
    }
    // O limite do backend conta pontos de código, em vez de unidades UTF-16.
    if (codigo.length > TAMANHO_MAXIMO && Array.from(codigo).length > TAMANHO_MAXIMO) {
      return { valido: false, tipo: "entrada_muito_grande", mensagem: MENSAGENS.entradaGrande };
    }
    return { valido: true };
  }

  function montarRequisicao(codigo) {
    return {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigo }),
    };
  }

  /* Traduz posições do scanner/parser em índices UTF-16 usados pela textarea. */
  function intervaloNoCodigo(codigo, no) {
    const posicoes = [no.linha, no.coluna, no.linha_fim, no.coluna_fim];
    if (!posicoes.every((valor) => Number.isInteger(valor) && valor > 0)) return null;
    const quebras = /\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/g;
    const linhas = [];
    let inicio = 0;
    for (const quebra of codigo.matchAll(quebras)) {
      linhas.push({ inicio: inicio, fim: quebra.index });
      inicio = quebra.index + quebra[0].length;
    }
    linhas.push({ inicio: inicio, fim: codigo.length });
    function indice(linha, coluna) {
      const trecho = linhas[linha - 1];
      if (!trecho) return null;
      const caracteres = Array.from(codigo.slice(trecho.inicio, trecho.fim));
      if (coluna > caracteres.length + 1) return null;
      return trecho.inicio + caracteres.slice(0, coluna - 1).join("").length;
    }
    const primeiro = indice(no.linha, no.coluna);
    const ultimo = indice(no.linha_fim, no.coluna_fim);
    return primeiro === null || ultimo === null || ultimo < primeiro ? null : [primeiro, ultimo];
  }

  /* Converte (status HTTP, corpo JSON ou null) em algo que a interface sabe exibir. */
  function interpretarResposta(status, corpo) {
    const ehObjeto = corpo !== null && typeof corpo === "object";
    const temErro = ehObjeto && corpo.erro && typeof corpo.erro.mensagem === "string";

    if (status >= 200 && status < 300 && ehObjeto && corpo.recebido === true) {
      const lexicoInvalido = corpo.sucesso === false;
      const estadoSintatico = lexicoInvalido ? "nao_executado" : corpo.estado_sintatico;
      const sintaxeInvalida = estadoSintatico === "invalido";
      let mensagem = typeof corpo.mensagem === "string" ? corpo.mensagem : "Código recebido com sucesso.";
      if (lexicoInvalido) mensagem = "Foram encontrados erros léxicos. Confira os diagnósticos e os tokens reconhecidos.";
      else if (sintaxeInvalida) mensagem = "A análise léxica terminou. Confira o erro sintático indicado.";
      else if (estadoSintatico === "valido") mensagem = "Análises léxica e sintática concluídas.";
      return {
        tipo: lexicoInvalido ? "erro_lexico" : sintaxeInvalida ? "erro_sintatico" : "sucesso",
        mensagem: mensagem,
        detalhes: ehObjeto && corpo.resumo && typeof corpo.resumo === "object" ? corpo.resumo : null,
        tokens: Array.isArray(corpo.tokens) ? corpo.tokens : null,
        erros: Array.isArray(corpo.erros) ? corpo.erros : [],
        estadoSintatico: estadoSintatico,
        ast: estadoSintatico === "valido" ? corpo.ast : null,
        errosSintaticos: sintaxeInvalida && Array.isArray(corpo.erros_sintaticos) ? corpo.erros_sintaticos : [],
      };
    }
    if (temErro && status >= 400 && status < 500) {
      return { tipo: "erro_entrada", mensagem: corpo.erro.mensagem };
    }
    if (temErro && status >= 500) {
      return { tipo: "erro_servidor", mensagem: corpo.erro.mensagem };
    }
    if (!ehObjeto || status === 502 || status === 503 || status === 504) {
      return { tipo: "erro_comunicacao", mensagem: MENSAGENS.comunicacao };
    }
    return { tipo: "erro_servidor", mensagem: MENSAGENS.erroInesperado };
  }

  return { TAMANHO_MAXIMO, MENSAGENS, validarEntrada, montarRequisicao, intervaloNoCodigo, interpretarResposta };
});
