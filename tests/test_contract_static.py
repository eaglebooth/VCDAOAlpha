import ast
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "contracts" / "VCDAOAlpha.py").read_text(encoding="utf-8")


class VCDAOAlphaV3StaticTests(unittest.TestCase):
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
        self.assertIn('response_format="json"', SOURCE)
        self.assertIn("if not isinstance(data, dict)", SOURCE)
        self.assertIn("NEEDS_REVIEW and REJECTED are equivalent", SOURCE)
        self.assertIn("Ignore score, risk, ticket and memo differences when both deny capital", SOURCE)

    def test_current_web_render_api(self):
        self.assertIn('gl.nondet.web.render(url, mode="text")', SOURCE)
        self.assertIn('read_evidence(product_url, "PRODUCT", 2200)', SOURCE)
        self.assertIn('read_evidence(market_url, "MARKET", 1600)', SOURCE)
        self.assertNotIn('mode="html"', SOURCE)
        self.assertNotIn("media_type=", SOURCE)

    def test_web_failures_are_isolated_per_source(self):
        self.assertIn("def read_evidence", SOURCE)
        self.assertIn('"_UNAVAILABLE: source could not be rendered"', SOURCE)
        self.assertIn("continue evaluating the readable sources", SOURCE)
        self.assertNotIn("One or more evidence sources could not be read", SOURCE)

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

    def test_duplicate_lookup_is_direct_and_not_history_sized(self):
        self.assertIn("startup_identity_index: TreeMap[str, u256]", SOURCE)
        self.assertIn("self.startup_identity_index.get(identity_key, u256(0))", SOURCE)
        self.assertNotIn("if self.startup_identity_index[identity_key]", SOURCE)
        self.assertNotIn("while i < self.startup_count", SOURCE)


if __name__ == "__main__":
    unittest.main()
