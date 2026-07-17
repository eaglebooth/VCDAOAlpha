import assert from "node:assert/strict";
import test from "node:test";

import { validateInitializeInput } from "../src/lib/action-validation.ts";

test("rejects a ticket larger than initial capital", () => {
  assert.equal(
    validateInitializeInput({ capital: "1", maxTicket: "2", minimumScore: "80" }),
    "Maximum seed ticket cannot exceed initial treasury capital.",
  );
});

test("accepts a valid initialization configuration", () => {
  assert.equal(
    validateInitializeInput({ capital: "1000", maxTicket: "250", minimumScore: "80" }),
    null,
  );
});
