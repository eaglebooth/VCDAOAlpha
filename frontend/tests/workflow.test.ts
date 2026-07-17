import assert from "node:assert/strict";
import test from "node:test";

import { nextAction, sameAddress, validateStartupAction } from "../src/lib/workflow.ts";

const startup = { founder: "0xFounder", name: "Alpha", status: "SOURCED", requested_ticket: "100", terms_url: "" };

test("compares wallet roles without checksum casing errors", () => {
  assert.equal(sameAddress("0xABcd", "0xabCD"), true);
});

test("blocks founder evidence from an unrelated wallet", () => {
  assert.match(validateStartupAction("evidence", startup, "0xOther", "0xManager") || "", /recorded founder/);
});

test("blocks actions that do not match the live lifecycle status", () => {
  assert.match(validateStartupAction("execute", startup, "0xManager", "0xManager") || "", /Expected ACCEPTED/);
});

test("routes a successful source transaction into evidence collection", () => {
  assert.deepEqual(nextAction("source", "4"), { href: "/startups/4/evidence", label: "Attach founder evidence" });
});
