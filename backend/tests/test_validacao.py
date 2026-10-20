"""Testes unitários das regras de validação (rodam com pytest ou unittest)."""
import unittest

from app import validacao


class TestValidarCodigo(unittest.TestCase):
    def test_codigo_valido_nao_gera_erro(self):
        self.assertIsNone(validacao.validar_codigo("x = 10"))

    def test_texto_vazio(self):
        erro = validacao.validar_codigo("")
        self.assertEqual((erro.tipo, erro.status), ("entrada_vazia", 400))
        self.assertEqual(erro.mensagem, "Informe um código-fonte antes de solicitar a análise.")

    def test_somente_espacos_e_quebras_de_linha(self):
        for texto in ["   ", "\n\n", "\t \r\n", "\u00a0"]:
            with self.subTest(texto=repr(texto)):
                erro = validacao.validar_codigo(texto)
                self.assertEqual(erro.tipo, "entrada_vazia")

    def test_valor_que_nao_e_texto(self):
        for valor in [None, 10, 2.5, True, ["x = 1"], {"codigo": "x"}]:
            with self.subTest(valor=repr(valor)):
                erro = validacao.validar_codigo(valor)
                self.assertEqual((erro.tipo, erro.status), ("requisicao_invalida", 400))

    def test_limite_de_tamanho(self):
        self.assertIsNone(validacao.validar_codigo("a" * validacao.TAMANHO_MAXIMO))
        erro = validacao.validar_codigo("a" * (validacao.TAMANHO_MAXIMO + 1))
        self.assertEqual((erro.tipo, erro.status), ("entrada_muito_grande", 413))

    def test_caracteres_especiais_sao_aceitos(self):
        codigo = "texto = 'ação ✓ 日本'  # $ % & < > \" \\ \t"
        self.assertIsNone(validacao.validar_codigo(codigo))

    def test_codigo_com_erros_intencionais_e_aceito(self):
        # Esta etapa não analisa o programa: erros de sintaxe não bloqueiam o envio.
        self.assertIsNone(validacao.validar_codigo("x = = 5 +\nif :"))


class TestResumir(unittest.TestCase):
    def test_uma_linha(self):
        self.assertEqual(validacao.resumir("x = 1"), {"linhas": 1, "caracteres": 5})

    def test_varias_linhas(self):
        self.assertEqual(validacao.resumir("a\nb\n"), {"linhas": 2, "caracteres": 4})

    def test_quebras_de_linha_windows(self):
        self.assertEqual(validacao.resumir("a\r\nb")["linhas"], 2)


if __name__ == "__main__":
    unittest.main()
