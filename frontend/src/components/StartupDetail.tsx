"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { readContract } from "@/lib/genlayer";
import { useContractAddress } from "./ContractProvider";

const actionForStatus: Record<string, [string, string]> = {
  SOURCED: ["Attach founder evidence", "evidence"],
  EVIDENCE_READY: ["Run AI diligence", "diligence"],
  APPROVED: ["Issue term sheet", "term-sheet"],
  OFFERED: ["Accept offer", "accept"],
  ACCEPTED: ["Execute investment", "execute"],
};

export function StartupDetail({ id }: { id: string }) {
  const { address } = useContractAddress();
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [diligence, setDiligence] = useState<Record<string, string> | null>(null);
  const [message, setMessage] = useState("Sync this candidate from Studionet.");

  async function sync() {
    const [startup, review] = await Promise.all([
      readContract("get_startup", [Number(id)], address),
      readContract("get_diligence", [Number(id)], address),
    ]);
    if (!startup.success || !review.success) {
      setMessage(startup.error || review.error || "Read failed.");
      return;
    }
    try {
      const parsed = JSON.parse(String(startup.data));
      if (parsed.error) {
        setMessage(parsed.error);
        return;
      }
      setData(parsed);
      setDiligence(JSON.parse(String(review.data)));
      setMessage("Live startup and diligence state received.");
    } catch {
      setMessage("Malformed contract response.");
    }
  }

  const links = data ? Object.entries(data).filter(([key, value]) => key.endsWith("_url") && value) : [];
  const primaryAction = data?.status ? actionForStatus[data.status] : null;

  return <section className="section compact">
    <div className="directory-head"><div><span>Candidate #{id}</span><h2>{data?.name || "Startup record"}</h2><p>{message}</p></div><button className="quiet-button" onClick={sync} disabled={!address}><RefreshCw size={16} />Sync candidate</button></div>
    {data && <div className="detail-grid"><article className="detail-card"><span className="status">{data.status}</span><h3>{data.sector}</h3><p>Founder: <code>{data.founder}</code></p><p>Requested: <strong>{data.requested_ticket} wei</strong></p><div className="link-stack">{links.map(([key, value]) => <a href={value} target="_blank" rel="noreferrer" key={key}>{key}<ExternalLink size={13} /></a>)}</div></article><article className="detail-card memo-card"><span>Validator memo</span><h3>{diligence?.decision}</h3><p>{diligence?.memo}</p><div className="score-line"><b>Score {diligence?.score}</b><b>Risk {diligence?.risk_score}</b><b>Ticket {diligence?.recommended_ticket}</b></div></article></div>}
    <div className="action-links">{primaryAction && <Link className="primary-button" href={`/startups/${id}/${primaryAction[1]}`}>{primaryAction[0]}</Link>}{data && ["OFFERED", "ACCEPTED"].includes(data.status) && <Link className="quiet-button" href={`/startups/${id}/cancel`}>Manager cancellation</Link>}<Link className="quiet-button" href="/review">Reviewer checklist</Link></div>
  </section>;
}
