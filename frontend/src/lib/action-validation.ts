export type InitializeInput = {
  capital: string;
  maxTicket: string;
  minimumScore: string;
};

export function validateInitializeInput(input: InitializeInput): string | null {
  try {
    const capital = BigInt(input.capital);
    const maxTicket = BigInt(input.maxTicket);
    const minimumScore = BigInt(input.minimumScore);

    if (capital <= BigInt(0)) return "Initial treasury capital must be greater than zero.";
    if (maxTicket <= BigInt(0)) return "Maximum seed ticket must be greater than zero.";
    if (maxTicket > capital) return "Maximum seed ticket cannot exceed initial treasury capital.";
    if (minimumScore < BigInt(60) || minimumScore > BigInt(100)) {
      return "Minimum approval score must be between 60 and 100.";
    }
    return null;
  } catch {
    return "Enter valid whole-number treasury values in wei.";
  }
}

export function readInitializedManager(data: unknown): string {
  return readFundState(data)?.manager || "";
}

export type FundState = {
  manager: string;
  available: string;
  max_ticket: string;
  min_score: string;
};

export function readFundState(data: unknown): FundState | null {
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (!parsed || typeof parsed !== "object" || !("manager" in parsed)) return null;
    const state = parsed as Record<string, unknown>;
    return {
      manager: String(state.manager || ""),
      available: String(state.available || "0"),
      max_ticket: String(state.max_ticket || "0"),
      min_score: String(state.min_score || "0"),
    };
  } catch {
    return null;
  }
}
