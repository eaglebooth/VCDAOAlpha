import assert from "node:assert/strict";
import test from "node:test";

import { classifyReceipt } from "../src/lib/transaction-receipt.ts";

test("accepts an explicit successful execution", () => {
  assert.equal(classifyReceipt({ txExecutionResultName: "FINISHED_WITH_RETURN" }).kind, "success");
});

test("rejects an explicit execution error", () => {
  assert.equal(classifyReceipt({ txExecutionResultName: "FINISHED_WITH_ERROR" }).kind, "failure");
});

test("requires post-state verification when Studionet omits execution metadata", () => {
  assert.equal(classifyReceipt({ statusName: "ACCEPTED" }).kind, "state_verification_required");
});

test("does not mistake NOT_VOTED for success", () => {
  assert.equal(classifyReceipt({ txExecutionResultName: "NOT_VOTED" }).kind, "state_verification_required");
});

test("surfaces a unanimous validator GenVM error when SDK metadata is absent", () => {
  const decision = classifyReceipt({
    statusName: "FINALIZED",
    consensus_data: {
      validators: [
        { genvm_result: { execution_result: "ERROR", stderr: "Traceback\nKeyError" } },
        { genvm_result: { execution_result: "ERROR", stderr: "Traceback\nKeyError" } },
      ],
    },
  });
  assert.equal(decision.kind, "failure");
  assert.match(decision.reason, /KeyError/);
});
