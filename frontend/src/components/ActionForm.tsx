"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { readContract, writeContract } from "@/lib/genlayer";
import { readFundState, type FundState, validateInitializeInput } from "@/lib/action-validation";
import { nextAction, parseRecord, validateStartupAction, type StartupState } from "@/lib/workflow";
import { useWallet } from "./WalletProvider";
import { useContractAddress } from "./ContractProvider";

type Mode =
  | "initialize"
  | "deposit"
  | "source"
  | "evidence"
  | "diligence"
  | "offer"
  | "accept"
  | "execute"
  | "cancel"
  | "withdraw";

const cfg: Record<Mode, [string, string]> = {
  initialize: ["initialize", "Initialize treasury"],
  deposit: ["deposit_treasury", "Deposit capital"],
  source: ["source_startup", "Submit startup"],
  evidence: ["attach_evidence", "Attach founder evidence"],
  diligence: ["run_due_diligence", "Run AI diligence"],
  offer: ["issue_term_sheet", "Issue term sheet"],
  accept: ["accept_term_sheet", "Accept term sheet"],
  execute: ["execute_investment", "Execute investment"],
  cancel: ["cancel_term_sheet", "Cancel offer"],
  withdraw: ["withdraw_unreserved", "Withdraw unreserved GEN"],
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function snapshotTarget(mode: Mode, startupId: string) {
  if (["evidence", "offer", "accept", "execute", "cancel"].includes(mode)) {
    return { functionName: "get_startup", args: [BigInt(startupId)] };
  }
  if (mode === "diligence") {
    return { functionName: "get_diligence", args: [BigInt(startupId)] };
  }
  return { functionName: "get_fund_state", args: [] };
}

export function ActionForm({ mode, startupId = "" }: { mode: Mode; startupId?: string }) {
  const { address: contract } = useContractAddress();
  const { address, connect } = useWallet();
  const [values, setValues] = useState({
    id: startupId,
    name: "",
    sector: "",
    ticket: "",
    product: "",
    docs: "",
    founder: "",
    code: "",
    market: "",
    terms: "",
    value: "",
    max: "",
    score: "80",
  });
  const [message, setMessage] = useState("");
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkingState, setCheckingState] = useState(mode === "initialize" && Boolean(contract));
  const [initializedManager, setInitializedManager] = useState("");
  const [initializedFund, setInitializedFund] = useState<FundState | null>(null);
  const [nextStep, setNextStep] = useState<{ href: string; label: string } | null>(null);

  useEffect(() => {
    if (mode !== "initialize" || !contract) {
      return;
    }

    let cancelled = false;
    async function checkInitialization() {
      const state = await readContract("get_fund_state", [], contract);
      if (cancelled) return;
      const fund = state.success ? readFundState(state.data) : null;
      const manager = fund?.manager || "";
      setInitializedFund(fund);
      setInitializedManager(manager);
      if (manager) {
        setBad(false);
        setMessage(`Treasury is already initialized by ${manager}. Use the Fund dashboard for treasury operations.`);
      }
      setCheckingState(false);
    }
    void checkInitialization();
    return () => {
      cancelled = true;
    };
  }, [contract, mode]);

  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!address) {
      await connect();
      return;
    }
    if (!contract) {
      setBad(true);
      setMessage("VCDAO Alpha contract address is not configured.");
      return;
    }

    let args: unknown[] = [];
    let value = BigInt(0);
    try {
      if (mode === "initialize") {
        const validationError = validateInitializeInput({
          capital: values.value,
          maxTicket: values.max,
          minimumScore: values.score,
        });
        if (validationError) {
          setBad(true);
          setMessage(validationError);
          return;
        }
        args = [BigInt(values.max), BigInt(values.score)];
        value = BigInt(values.value);
      }
      if (mode === "deposit") value = BigInt(values.value);
      if (mode === "source") args = [values.name, values.sector, BigInt(values.ticket), values.product, values.docs];
      if (mode === "evidence") args = [BigInt(values.id), values.founder, values.code, values.market];
      if (["diligence", "accept", "execute", "cancel"].includes(mode)) args = [BigInt(values.id)];
      if (mode === "offer") args = [BigInt(values.id), values.terms];
      if (mode === "withdraw") args = [BigInt(values.value)];
    } catch {
      setBad(true);
      setMessage("Enter valid whole-number IDs and GEN amounts in wei.");
      return;
    }

    const target = snapshotTarget(mode, values.id);
    setNextStep(null);
    const fundRead = await readContract("get_fund_state", [], contract);
    const fund = fundRead.success ? readFundState(fundRead.data) : null;
    if (!fund) {
      setBad(true);
      setMessage(`Fund preflight failed: ${fundRead.error || "live fund state is unavailable"}`);
      return;
    }
    if (mode === "source") {
      if (BigInt(values.ticket) > BigInt(fund.max_ticket)) {
        setBad(true);
        setMessage(`Requested ticket exceeds the live ${fund.max_ticket} wei fund ceiling.`);
        return;
      }
    }
    if (["deposit", "withdraw"].includes(mode) && address.toLowerCase() !== fund.manager.toLowerCase()) {
      setBad(true);
      setMessage(`Connect the fund manager wallet ${fund.manager} to perform this action.`);
      return;
    }
    if (["evidence", "diligence", "offer", "accept", "execute", "cancel"].includes(mode)) {
      const startupRead = await readContract("get_startup", [BigInt(values.id)], contract);
      const startup = startupRead.success ? parseRecord<StartupState>(startupRead.data) : null;
      if (!startup || (startup as StartupState & { error?: string }).error) {
        setBad(true);
        setMessage(`Candidate preflight failed: ${(startup as StartupState & { error?: string } | null)?.error || startupRead.error || "record unavailable"}`);
        return;
      }
      const validationError = validateStartupAction(mode, startup, address, fund.manager);
      if (validationError) {
        setBad(true);
        setMessage(validationError);
        return;
      }
    }
    const before = await readContract(target.functionName, target.args, contract);
    if (!before.success) {
      setBad(true);
      setMessage(`Pre-write verification failed: ${before.error || "state unavailable"}`);
      return;
    }
    if (mode === "initialize") {
      const fund = readFundState(before.data);
      const manager = fund?.manager || "";
      if (manager) {
        setInitializedFund(fund);
        setInitializedManager(manager);
        setBad(false);
        setMessage(`Treasury is already initialized by ${manager}. Use the Fund dashboard for treasury operations.`);
        return;
      }
    }

    setBusy(true);
    setBad(false);
    setMessage("Confirm the transaction. VCDAO Alpha will verify accepted execution against live state.");
    const result = await writeContract(cfg[mode][0], args, contract, value);
    if (!result.success) {
      setBusy(false);
      setBad(!result.pending);
      setMessage(result.error || "Contract call failed.");
      if (result.pending && mode === "diligence") {
        setNextStep({ href: `/startups/${values.id}`, label: "Monitor candidate state" });
      }
      return;
    }

    const after = await readContract(target.functionName, target.args, contract);
    setBusy(false);
    if (!after.success) {
      setBad(true);
      setMessage(`Transaction ${result.hash || "submitted"}, but post-write state could not be verified: ${after.error || "read failed"}`);
      return;
    }
    if (String(before.data) === String(after.data)) {
      setBad(true);
      const contractResult = result.data ? ` Contract result: ${String(result.data)}.` : "";
      setMessage(`Transaction ${result.hash || "submitted"} reached ${result.status || "ACCEPTED"}, but the contract did not change state.${contractResult} Check the input rules before retrying.`);
      return;
    }

    setBad(false);
    setMessage(`Verified on-chain state change at ${result.status || "ACCEPTED"}. Transaction: ${result.hash}`);
    if (mode === "initialize") {
      const liveFund = readFundState(after.data);
      if (liveFund?.manager) {
        setInitializedFund(liveFund);
        setInitializedManager(liveFund.manager);
      }
    }
    let resolvedId = values.id;
    if (mode === "source") {
      const afterFund = readFundState(after.data);
      if (afterFund && BigInt(afterFund.startup_count) > BigInt(0)) {
        resolvedId = String(BigInt(afterFund.startup_count) - BigInt(1));
      }
    }
    setNextStep(nextAction(mode, resolvedId));
  }

  const startupIdField = (
    <Field label="Startup ID">
      <input type="number" min="0" value={values.id} onChange={(event) => update("id", event.target.value)} required />
    </Field>
  );

  if (mode === "initialize" && initializedManager) {
    return (
      <section className="action-card reviewer-handoff">
        <div className="form-title">
          <span>Initialization verified</span>
          <h2>Fund is live. Test the investment flow.</h2>
          <code>{initializedManager}</code>
        </div>
        <p className="handoff-copy">
          Initialization is intentionally one-time. Reviewers can connect any wallet,
          submit a startup as its founder, attach evidence, and run GenLayer diligence.
        </p>
        <div className="fund-state-strip">
          <div><span>Available</span><strong>{initializedFund?.available || "0"} wei</strong></div>
          <div><span>Ticket ceiling</span><strong>{initializedFund?.max_ticket || "0"} wei</strong></div>
          <div><span>Approval gate</span><strong>{initializedFund?.min_score || "0"}/100</strong></div>
        </div>
        <div className="button-row">
          <Link className="primary-button" href="/startups/submit">Submit test startup <ArrowRight size={17} /></Link>
          <Link className="quiet-button" href="/startups">Browse pipeline</Link>
          <Link className="quiet-button" href="/contract">Use another deployment</Link>
        </div>
      </section>
    );
  }

  return (
    <form className="action-card" onSubmit={submit}>
      <div className="form-title">
        <span>Contract action</span>
        <h2>{cfg[mode][1]}</h2>
        <code>{cfg[mode][0]}</code>
      </div>
      <div className="field-grid">
        {mode === "initialize" && (
          <>
            <Field label="Initial treasury capital (wei)"><input type="number" min="1" value={values.value} onChange={(event) => update("value", event.target.value)} disabled={Boolean(initializedManager)} required /></Field>
            <Field label="Maximum seed ticket (wei)"><input type="number" min="1" max={values.value || undefined} value={values.max} onChange={(event) => update("max", event.target.value)} disabled={Boolean(initializedManager)} required /></Field>
            <Field label="Minimum approval score"><input type="number" min="60" max="100" value={values.score} onChange={(event) => update("score", event.target.value)} disabled={Boolean(initializedManager)} required /></Field>
          </>
        )}
        {mode === "deposit" && <Field label="Deposit value (wei)"><input type="number" min="1" value={values.value} onChange={(event) => update("value", event.target.value)} required /></Field>}
        {mode === "source" && (
          <>
            <Field label="Startup name"><input value={values.name} onChange={(event) => update("name", event.target.value)} required /></Field>
            <Field label="Sector"><input value={values.sector} onChange={(event) => update("sector", event.target.value)} required /></Field>
            <Field label="Requested ticket (wei)"><input type="number" min="1" value={values.ticket} onChange={(event) => update("ticket", event.target.value)} required /></Field>
            <Field label="Product URL"><input type="url" value={values.product} onChange={(event) => update("product", event.target.value)} required /></Field>
            <Field label="Documentation URL"><input type="url" value={values.docs} onChange={(event) => update("docs", event.target.value)} required /></Field>
          </>
        )}
        {mode === "evidence" && (
          <>
            {startupIdField}
            <Field label="Founder profile URL"><input type="url" value={values.founder} onChange={(event) => update("founder", event.target.value)} required /></Field>
            <Field label="Code repository URL"><input type="url" value={values.code} onChange={(event) => update("code", event.target.value)} required /></Field>
            <Field label="Market evidence URL"><input type="url" value={values.market} onChange={(event) => update("market", event.target.value)} required /></Field>
          </>
        )}
        {["diligence", "accept", "execute", "cancel"].includes(mode) && startupIdField}
        {mode === "offer" && <>{startupIdField}<Field label="Immutable term sheet URL"><input type="url" value={values.terms} onChange={(event) => update("terms", event.target.value)} required /></Field></>}
        {mode === "withdraw" && <Field label="Withdrawal amount (wei)"><input type="number" min="1" value={values.value} onChange={(event) => update("value", event.target.value)} required /></Field>}
      </div>
      {message && <div className={`notice ${bad ? "error" : ""}`}>{message}</div>}
      <button className="primary-button" disabled={busy || checkingState}>
        {checkingState ? "Checking treasury state" : address ? (busy ? "Verifying accepted transaction" : cfg[mode][1]) : "Connect wallet first"}
        <ArrowRight size={17} />
      </button>
      {nextStep && <Link className="quiet-button next-step" href={nextStep.href}>{nextStep.label}<ArrowRight size={17} /></Link>}
      {!bad && message && <CheckCircle2 className="success-icon" />}
    </form>
  );
}
