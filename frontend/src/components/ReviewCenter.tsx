"use client";

import { CheckCircle2, CircleAlert, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { readFundState, type FundState } from "@/lib/action-validation";
import { readContract } from "@/lib/genlayer";
import { parseRecord, type StartupState } from "@/lib/workflow";
import { useContractAddress } from "./ContractProvider";

type ReviewRow = StartupState & { id: string };

const statusLink = (row: ReviewRow) => {
  const map: Record<string, [string, string]> = {
    SOURCED: ["Attach evidence", `/startups/${row.id}/evidence`],
    EVIDENCE_READY: ["Run AI diligence", `/startups/${row.id}/diligence`],
    APPROVED: ["Issue term sheet", `/startups/${row.id}/term-sheet`],
    OFFERED: ["Founder acceptance", `/startups/${row.id}/accept`],
    ACCEPTED: ["Settle investment", `/startups/${row.id}/execute`],
    FUNDED: ["View portfolio", "/portfolio"],
  };
  return map[row.status] || ["Inspect record", `/startups/${row.id}`];
};

export function ReviewCenter() {
  const { address } = useContractAddress();
  const explorerUrl = address ? `https://explorer-studio.genlayer.com/address/${address}` : "";
  const [fund, setFund] = useState<FundState | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [message, setMessage] = useState("Sync the active deployment to begin the reviewer walkthrough.");
  const [busy, setBusy] = useState(false);

  async function sync() {
    if (!address) return;
    setBusy(true);
    const result = await readContract("get_fund_state", [], address);
    const nextFund = result.success ? readFundState(result.data) : null;
    if (!nextFund) {
      setMessage(result.error || "The deployed fund could not be read.");
      setBusy(false);
      return;
    }
    const count = Number(nextFund.startup_count);
    const reads = await Promise.all(Array.from({ length: count }, (_, id) => readContract("get_startup", [BigInt(id)], address)));
    const records = reads.flatMap((item, id) => {
      const record = item.success ? parseRecord<StartupState>(item.data) : null;
      return record ? [{ ...record, id: String(id) }] : [];
    });
    setFund(nextFund);
    setRows(records);
    setMessage(`Verified ${count} candidate record${count === 1 ? "" : "s"} from the active Studionet deployment.`);
    setBusy(false);
  }

  const hasCandidate = rows.length > 0;
  const hasConsensus = rows.some((row) => !["SOURCED", "EVIDENCE_READY"].includes(row.status));
  const hasSettlement = Number(fund?.portfolio_count || 0) > 0;

  return <section className="section compact review-center">
    <div className="review-toolbar">
      <div><span>Submission verification</span><h2>Live reviewer checklist</h2><p>{message}</p></div>
      <div className="button-row">
        <button className="quiet-button" onClick={sync} disabled={busy || !address}><RefreshCw size={16} />{busy ? "Syncing" : "Sync contract"}</button>
        {explorerUrl && <a className="quiet-button" href={explorerUrl} target="_blank" rel="noreferrer">Explorer <ExternalLink size={15} /></a>}
      </div>
    </div>

    <div className="review-grid">
      {[
        [Boolean(fund?.manager), "Deployment readable", "Fund configuration is returned by the submitted contract."],
        [hasCandidate, "Founder write recorded", "At least one startup was sourced by an authenticated wallet."],
        [hasConsensus, "AI consensus recorded", "A candidate has progressed through GenLayer diligence."],
        [hasSettlement, "Capital settlement recorded", "A funded portfolio position proves the payable lifecycle."],
      ].map(([pass, title, copy]) => <article className={pass ? "review-check pass" : "review-check"} key={String(title)}>
        {pass ? <CheckCircle2 /> : <CircleAlert />}<div><strong>{title}</strong><p>{copy}</p></div>
      </article>)}
    </div>

    <div className="role-note">
      <div><span>Founder wallet</span><strong>Source startup, attach evidence, accept an offer</strong></div>
      <div><span>Fund manager</span><strong>Deposit capital, issue or cancel terms, settle investment</strong></div>
      <div><span>Permissionless</span><strong>Read state and run evidence-ready AI diligence</strong></div>
    </div>

    <div className="review-pipeline">
      <div className="directory-head"><div><span>State-aware test path</span><h2>Continue the live lifecycle</h2></div><Link className="primary-button" href="/startups/submit">Source a startup</Link></div>
      {rows.length === 0 ? <div className="empty">No candidate exists yet. Connect a founder wallet and source the first real evidence-backed startup.</div> : rows.map((row) => {
        const [label, href] = statusLink(row);
        return <article className="review-row" key={row.id}><span>#{row.id}</span><div><strong>{row.name}</strong><small>{row.founder}</small></div><b>{row.status}</b><Link className="quiet-button" href={href}>{label}</Link></article>;
      })}
    </div>
  </section>;
}
