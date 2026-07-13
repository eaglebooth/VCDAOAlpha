import ast
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "contracts" / "VCDAOAlpha.py").read_text(encoding="utf-8")


class VCDAOAlphaV2Tests(unittest.TestCase):
    def test_runtime_header_and_parse(self):
        self.assertEqual(SOURCE.splitlines()[0], "# v0.2.16")
        ast.parse(SOURCE)

    def test_real_payable_treasury(self):
        self.assertIn("@gl.public.write.payable", SOURCE)
        self.assertIn("gl.message.value", SOURCE)
        self.assertIn("fund_received", SOURCE)
        self.assertIn("withdraw_unreserved", SOURCE)

    def test_real_investment_transfer(self):
        self.assertIn("execute_investment", SOURCE)
        self.assertIn("emit_transfer(value=amount)", SOURCE)
        self.assertIn("FOUNDER_ACCEPTANCE_REQUIRED", SOURCE)

    def test_sender_authentication(self):
        self.assertIn("gl.message.sender_address.as_hex", SOURCE)
        self.assertIn("NOT_FUND_MANAGER", SOURCE)
        self.assertIn("NOT_STARTUP_FOUNDER", SOURCE)
        self.assertNotIn("def initialize(self, owner:", SOURCE)

    def test_semantic_consensus(self):
        self.assertIn("gl.eq_principle.prompt_comparative", SOURCE)
        self.assertNotIn("gl.eq_principle.strict_eq", SOURCE)

    def test_current_web_render_api(self):
        self.assertIn('gl.nondet.web.render(product_url, mode="html")', SOURCE)
        self.assertNotIn("media_type=", SOURCE)

    def test_lifecycle_guards(self):
        for marker in ("STARTUP_ALREADY_SOURCED", "EVIDENCE_NOT_READY", "TERM_SHEET_NOT_OPEN", "OFFER_NOT_ACTIVE", "RESERVE_MISMATCH"):
            self.assertIn(marker, SOURCE)

    def test_reserve_conservation(self):
        self.assertIn("self.fund_reserved = self.fund_reserved + ticket", SOURCE)
        self.assertIn("self.fund_reserved = self.fund_reserved - amount", SOURCE)
        self.assertIn("self.fund_deployed = self.fund_deployed + amount", SOURCE)

    def test_offer_and_portfolio_storage_are_separate(self):
        self.assertIn("startup_terms_url: TreeMap[u256, str]", SOURCE)
        self.assertIn("self.portfolio_terms[portfolio_id] = self.startup_terms_url[startup_id]", SOURCE)
        self.assertNotIn("self.portfolio_terms[startup_id] = terms_url", SOURCE)


if __name__ == "__main__":
    unittest.main()
