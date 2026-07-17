import assert from "node:assert/strict";
import test from "node:test";

import { readInitializedManager, validateInitializeInput } from "../src/lib/action-validation.ts";

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

test("detects an initialized manager from a contract view", () => {
  assert.equal(
    readInitializedManager('{"manager":"0xeb57bc7125fa60d7482CE12058397369AB3581f8"}'),
    "0xeb57bc7125fa60d7482CE12058397369AB3581f8",
  );
});
