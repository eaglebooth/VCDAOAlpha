export type ReceiptLike = {
  statusName?: string;
  txExecutionResultName?: string;
  txDataDecoded?: unknown;
};

export type ReceiptDecision =
  | { kind: "success"; reason: string }
  | { kind: "failure"; reason: string }
  | { kind: "state_verification_required"; reason: string };

export function classifyReceipt(receipt: ReceiptLike): ReceiptDecision {
  const result = receipt.txExecutionResultName;

  if (result === "FINISHED_WITH_RETURN") {
    return { kind: "success", reason: "Execution returned successfully." };
  }

  if (result === "FINISHED_WITH_ERROR") {
    return { kind: "failure", reason: "The contract returned an execution error." };
  }

  return {
    kind: "state_verification_required",
    reason: result
      ? `Execution is not complete (${result}). Verify the affected state before reporting success.`
      : "Studionet omitted execution-result metadata. Verify the affected state before reporting success.",
  };
}
