"use client";

import { ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { readContract } from "@/lib/genlayer";
import { useContractAddress } from "./ContractProvider";

export function Directory({ kind }: { kind: "startups" | "portfolio" }) {
  const { address } = useContractAddress();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [message, setMessage] = useState(address ? "Ready to sync live records." : "V3 contract deployment pending.");

  async function sync() {
    const state = await readContract("get_fund_state", [], address);
    if (!state.success) {
      setMessage(state.error || "Fund read failed.");
      return;
    }
    try {
      const fund = JSON.parse(String(state.data));
      const count = Number(kind === "startups" ? fund.startup_count : fund.portfolio_count);
      const reads = await Promise.all(Array.from({ length: count }, (_, index) =>
        readContract(kind === "startups" ? "get_startup" : "get_portfolio_position", [index], address),
      ));
      setRows(reads.filter((result) => result.success).map((result) => JSON.parse(String(result.data))));
      setMessage(`${count} live ${kind} record${count === 1 ? "" : "s"} received.`);
    } catch {
      setMessage("Contract returned malformed records.");
    }
  }

  return <section className="section compact">
    <div className="directory-head"><div><span>On-chain directory</span><h2>{kind === "startups" ? "Startup pipeline" : "Funded positions"}</h2><p>{message}</p></div><button className="quiet-button" onClick={sync} disabled={!address}><RefreshCw size={16} />Sync records</button></div>
    <div className="record-list">{rows.length === 0 ? <div className="empty">No live records loaded. Sync the deployed contract to inspect state.</div> : rows.map((row, index) => <article className="record" key={index}><span>#{index}</span><div><strong>{row.name || `Portfolio position ${index}`}</strong><small>{row.sector || `Startup #${row.startup_id}`}</small></div><div><strong>{row.status || `${row.amount} GEN`}</strong><small>{row.founder || row.terms_url}</small></div>{kind === "startups" ? <Link className="icon-only" href={`/startups/${index}`}><ArrowRight /></Link> : <a className="icon-only" href={row.terms_url} target="_blank" rel="noreferrer"><ArrowRight /></a>}</article>)}</div>
  </section>;
}
