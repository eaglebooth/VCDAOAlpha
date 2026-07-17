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
