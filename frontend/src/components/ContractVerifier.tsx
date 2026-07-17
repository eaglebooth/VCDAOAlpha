"use client";

import { RefreshCw, RotateCcw } from "lucide-react";
import { useState } from "react";

import { readContract } from "@/lib/genlayer";
import { isContractAddress, useContractAddress } from "./ContractProvider";

export function ContractVerifier() {
  const { address, fallbackAddress, overridden, setAddress, resetAddress } = useContractAddress();
  const [draft, setDraft] = useState(address);
  const [message, setMessage] = useState("Enter a Studionet deployment, then prove it with a live state read.");
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);

  async function sync() {
    const candidate = draft.trim();
    if (!isContractAddress(candidate)) {
      setBad(true);
      setMessage("Enter a valid 0x contract address.");
      return;
    }
    setBusy(true);
    setBad(false);
    const result = await readContract("get_fund_state", [], candidate);
    setBusy(false);
    if (!result.success) {
      setBad(true);
      setMessage(result.error || "Contract read failed.");
      return;
    }
    setAddress(candidate);
    setMessage(`Live VCDAO Alpha state received from Studionet: ${String(result.data)}`);
  }

  return (
    <section className="action-card contract-verifier">
      <div className="form-title">
        <span>Reviewer-selectable deployment</span>
        <h2>Contract connection</h2>
        <code>{overridden ? "Browser-local override" : "Production default"}</code>
      </div>
      <Field label="Contract address">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="0x..." />
      </Field>
      <div className={`notice ${bad ? "error" : ""}`}>{message}</div>
      <div className="button-row">
        <button className="primary-button" onClick={sync} disabled={busy}>
          <RefreshCw size={16} /> {busy ? "Reading Studionet" : "Sync contract"}
        </button>
        <button className="quiet-button" onClick={() => { resetAddress(); setDraft(fallbackAddress); setMessage("Production default restored."); setBad(false); }}>
          <RotateCcw size={16} /> Restore production default
        </button>
      </div>
      <p className="contract-note">Active address: <code>{address || "Not configured"}</code></p>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
