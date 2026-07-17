export type StartupState = {
  founder: string;
  name: string;
  status: string;
  requested_ticket: string;
  terms_url: string;
};

export function parseRecord<T>(data: unknown): T | null {
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as T;
  } catch {
    return null;
  }
}

export function sameAddress(left: string, right: string): boolean {
  return Boolean(left && right) && left.toLowerCase() === right.toLowerCase();
}

const expectedStatus: Partial<Record<string, string[]>> = {
  evidence: ["SOURCED"],
  diligence: ["EVIDENCE_READY"],
  offer: ["APPROVED"],
  accept: ["OFFERED"],
  execute: ["ACCEPTED"],
  cancel: ["OFFERED", "ACCEPTED"],
};

export function validateStartupAction(
  mode: string,
  startup: StartupState,
  wallet: string,
  manager: string,
): string | null {
  const allowed = expectedStatus[mode];
  if (allowed && !allowed.includes(startup.status)) {
    return `${mode} is unavailable while candidate status is ${startup.status}. Expected ${allowed.join(" or ")}.`;
  }
  if (["evidence", "accept"].includes(mode) && !sameAddress(wallet, startup.founder)) {
    return `Connect the recorded founder wallet ${startup.founder} to perform this action.`;
  }
  if (["offer", "execute", "cancel"].includes(mode) && !sameAddress(wallet, manager)) {
    return `Connect the fund manager wallet ${manager} to perform this action.`;
  }
  return null;
}

export function nextAction(mode: string, startupId: string) {
  const actions: Record<string, { href: string; label: string }> = {
    source: { href: `/startups/${startupId}/evidence`, label: "Attach founder evidence" },
    evidence: { href: `/startups/${startupId}/diligence`, label: "Run AI diligence" },
    diligence: { href: `/startups/${startupId}`, label: "Inspect jury decision" },
    offer: { href: `/startups/${startupId}/accept`, label: "Open founder acceptance" },
    accept: { href: `/startups/${startupId}/execute`, label: "Open investment settlement" },
    execute: { href: "/portfolio", label: "View funded portfolio" },
    cancel: { href: "/startups", label: "Return to pipeline" },
    deposit: { href: "/fund", label: "View live fund" },
    withdraw: { href: "/fund", label: "View live fund" },
  };
  return actions[mode] || null;
}
