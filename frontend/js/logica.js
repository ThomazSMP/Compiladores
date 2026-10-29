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
    if (codigo.length > TAMANHO_MAXIMO) {
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

  /* Converte (status HTTP, corpo JSON ou null) em algo que a interface sabe exibir. */
  function interpretarResposta(status, corpo) {
    const ehObjeto = corpo !== null && typeof corpo === "object";
    const temErro = ehObjeto && corpo.erro && typeof corpo.erro.mensagem === "string";

    if (status >= 200 && status < 300 && ehObjeto && corpo.recebido === true) {
      return {
        tipo: corpo.sucesso === false ? "erro_lexico" : "sucesso",
        mensagem: typeof corpo.mensagem === "string" ? corpo.mensagem :
          (corpo.sucesso === false ? "Foram encontrados erros léxicos. Confira as mensagens e os tokens reconhecidos." : "Código recebido com sucesso."),
        detalhes: ehObjeto && corpo.resumo && typeof corpo.resumo === "object" ? corpo.resumo : null,
        tokens: Array.isArray(corpo.tokens) ? corpo.tokens : null,
        erros: Array.isArray(corpo.erros) ? corpo.erros : [],
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

  return { TAMANHO_MAXIMO, MENSAGENS, validarEntrada, montarRequisicao, interpretarResposta };
});
