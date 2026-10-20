"""Testes dos exemplos de programas (rodam com pytest ou unittest)."""
import unittest

from app import exemplos, validacao


class TestExemplos(unittest.TestCase):
    def test_ha_pelo_menos_tres_exemplos(self):
        self.assertGreaterEqual(len(exemplos.listar()), 3)

    def test_campos_obrigatorios(self):
        for exemplo in exemplos.listar():
            with self.subTest(id=exemplo.get("id")):
                for campo in ("id", "titulo", "descricao", "codigo"):
                    self.assertIsInstance(exemplo[campo], str)
                    self.assertTrue(exemplo[campo].strip(), f"campo {campo} vazio")

    def test_ids_sao_unicos(self):
        ids = [e["id"] for e in exemplos.listar()]
        self.assertEqual(len(ids), len(set(ids)))

    def test_todos_os_exemplos_sao_entradas_aceitas(self):
        for exemplo in exemplos.listar():
            with self.subTest(id=exemplo["id"]):
                self.assertIsNone(validacao.validar_codigo(exemplo["codigo"]))

    def test_exemplos_cobrem_o_subconjunto_previsto(self):
        por_id = {e["id"]: e["codigo"] for e in exemplos.listar()}
        self.assertIn("=", por_id["atribuicao"])
        self.assertTrue(all(op in por_id["aritmetica"] for op in "+-*/()"))
        self.assertIn("if", por_id["condicional"])
        self.assertIn("else", por_id["condicional"])
        self.assertIn(">", por_id["condicional"])

    def test_listar_devolve_copia(self):
        lista = exemplos.listar()
        lista[0]["codigo"] = "alterado"
        self.assertNotEqual(exemplos.listar()[0]["codigo"], "alterado")


if __name__ == "__main__":
    unittest.main()
