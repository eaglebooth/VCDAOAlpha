"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { readContract } from "@/lib/genlayer";
import { useContractAddress } from "./ContractProvider";

const initial = { available: "-", reserved: "-", deployed: "-", startup_count: "-", portfolio_count: "-" };

export function FundSnapshot() {
  const { address } = useContractAddress();
  const [data, setData] = useState<Record<string, string>>(initial);
  const [message, setMessage] = useState(address ? "Ready to read live fund state." : "Deploy VCDAO Alpha V3 to enable live data.");

  async function sync() {
    const result = await readContract("get_fund_state", [], address);
    if (!result.success) {
      setMessage(result.error || "Read failed.");
      return;
    }
    try {
      setData(JSON.parse(String(result.data)));
      setMessage("Live Studionet state verified.");
    } catch {
      setMessage("Contract returned malformed state.");
    }
  }

  return <section className="snapshot"><div className="snapshot-top"><div><span>Live treasury</span><strong>{message}</strong></div><button className="icon-button" onClick={sync} disabled={!address}><RefreshCw size={16} />Sync contract</button></div><div className="metric-grid">{[["Available GEN", data.available], ["Reserved GEN", data.reserved], ["Deployed GEN", data.deployed], ["Candidates", data.startup_count], ["Portfolio", data.portfolio_count]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section>;
}
