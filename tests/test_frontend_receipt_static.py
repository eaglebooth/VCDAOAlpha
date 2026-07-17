import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
GENLAYER = (ROOT / "frontend" / "src" / "lib" / "genlayer.ts").read_text(encoding="utf-8")
ACTION = (ROOT / "frontend" / "src" / "components" / "ActionForm.tsx").read_text(encoding="utf-8")


class FrontendReceiptStaticRegressionTests(unittest.TestCase):
    """Source regression checks only; these do not prove deployed execution."""

    def test_waits_for_accepted_instead_of_finalized(self):
        self.assertIn("TransactionStatus.ACCEPTED", GENLAYER)
        self.assertNotIn("TransactionStatus.FINALIZED", GENLAYER)

    def test_missing_execution_metadata_requires_state_verification(self):
        self.assertIn('verification: decision.kind === "success" ? "receipt" : "state_required"', GENLAYER)
        self.assertIn("post-write state could not be verified", ACTION)
        self.assertIn("contract did not change state", ACTION)


if __name__ == "__main__":
    unittest.main()
