import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
GENLAYER = (ROOT / "frontend" / "src" / "lib" / "genlayer.ts").read_text(encoding="utf-8")
ACTION = (ROOT / "frontend" / "src" / "components" / "ActionForm.tsx").read_text(encoding="utf-8")
CONTRACT_PROVIDER = (ROOT / "frontend" / "src" / "components" / "ContractProvider.tsx").read_text(encoding="utf-8")
CONTRACT_VERIFIER = (ROOT / "frontend" / "src" / "components" / "ContractVerifier.tsx").read_text(encoding="utf-8")


class FrontendReceiptStaticRegressionTests(unittest.TestCase):
    """Source regression checks only; these do not prove deployed execution."""

    def test_waits_for_accepted_instead_of_finalized(self):
        self.assertIn("TransactionStatus.ACCEPTED", GENLAYER)
        self.assertNotIn("TransactionStatus.FINALIZED", GENLAYER)
        self.assertIn("retries: 120", GENLAYER)
        self.assertIn("Do not resubmit; monitor the existing transaction", GENLAYER)

    def test_missing_execution_metadata_requires_state_verification(self):
        self.assertIn('verification: decision.kind === "success" ? "receipt" : "state_required"', GENLAYER)
        self.assertIn("post-write state could not be verified", ACTION)
        self.assertIn("contract did not change state", ACTION)

    def test_stale_runtime_override_restores_production_address(self):
        self.assertIn('readContract("get_fund_state", [], saved)', CONTRACT_PROVIDER)
        self.assertIn("window.localStorage.removeItem(storageKey)", CONTRACT_PROVIDER)
        self.assertIn("updateAddress(fallbackAddress)", CONTRACT_PROVIDER)
        self.assertIn("unavailable browser override was removed", CONTRACT_VERIFIER)


if __name__ == "__main__":
    unittest.main()
