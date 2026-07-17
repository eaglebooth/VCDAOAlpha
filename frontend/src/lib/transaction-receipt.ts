export type ReceiptLike = {
  statusName?: string;
  txExecutionResultName?: string;
  txDataDecoded?: unknown;
  consensus_data?: {
    validators?: Array<{
      genvm_result?: { execution_result?: string; stderr?: string };
    }>;
  };
};

export type ReceiptDecision =
  | { kind: "success"; reason: string }
  | { kind: "failure"; reason: string }
  | { kind: "state_verification_required"; reason: string };

export function classifyReceipt(receipt: ReceiptLike): ReceiptDecision {
  const result = receipt.txExecutionResultName;
  const validatorExecutions = receipt.consensus_data?.validators
    ?.map((validator) => validator.genvm_result)
    .filter((execution) => Boolean(execution?.execution_result)) || [];

  if (
    validatorExecutions.length > 0
    && validatorExecutions.every((execution) => execution?.execution_result === "ERROR")
  ) {
    const stderr = validatorExecutions.find((execution) => execution?.stderr)?.stderr || "";
    const detail = stderr.trim().split("\n").filter(Boolean).at(-1) || "GenVM execution failed.";
    return { kind: "failure", reason: `Contract execution failed: ${detail}` };
  }

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
