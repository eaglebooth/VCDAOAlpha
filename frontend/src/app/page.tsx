"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  BrainCircuit,
  BriefcaseBusiness,
  Cable,
  CircleDollarSign,
  FileText,
  Gauge,
  GitBranch,
  Globe2,
  Landmark,
  Link2,
  Radar,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { connectWallet, readContract, writeContract } from "@/lib/genlayer";

type DealState = {
  name: string;
  wallet: string;
  sector: string;
  requestedTicket: string;
  productUrl: string;
  docsUrl: string;
  founderUrl: string;
  codeUrl: string;
  marketUrl: string;
  startupId: string;
};

const defaultDeal: DealState = {
  name: "OrbitMesh Labs",
  wallet: "0x0000000000000000000000000000000000000007",
  sector: "AI infrastructure",
  requestedTicket: "250000",
  productUrl: "https://example.com/orbitmesh-launch",
  docsUrl: "https://example.com/orbitmesh-whitepaper",
  founderUrl: "https://example.com/orbitmesh-founder",
  codeUrl: "https://github.com/example/orbitmesh",
  marketUrl: "https://news.ycombinator.com/",
  startupId: "0",
};

const nodes = [
  ["OrbitMesh", "AI infra", "node-1"],
  ["VaultKit", "Devtools", "node-2"],
  ["LumaPay", "Fintech", "node-3"],
  ["ProofLoop", "Web3", "node-4"],
  ["SignalOS", "Data", "node-5"],
];

const sectors = ["AI infra", "Devtools", "DePIN", "Fintech", "Consumer", "Web3"];

function shortAddress(value: unknown) {
  const text = String(value || "");
  if (text.length < 12) return text;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

export default function Home() {
  const [deal, setDeal] = useState<DealState>(defaultDeal);
  const [wallet, setWallet] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready. Deploy the contract, then set NEXT_PUBLIC_CONTRACT_ADDRESS.");
  const [memo, setMemo] = useState("AI memo will appear after GenLayer validators complete due diligence.");
  const [stats, setStats] = useState({
    budget: "0",
    dryPowder: "0",
    deployed: "0",
    startups: "0",
    portfolio: "0",
  });

  const configured = useMemo(() => Boolean(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS), []);

  function updateDeal(key: keyof DealState, value: string) {
    setDeal((current) => ({ ...current, [key]: value }));
  }

  async function handleConnect() {
    const result = await connectWallet();
    if (result.success) {
      const account = String(result.data);
      setWallet(account);
      setStatus(`Wallet connected: ${shortAddress(account)}`);
    } else {
      setStatus(result.error || "Wallet connection failed");
    }
  }

  async function refreshFund() {
    const result = await readContract("get_fund_state");
    if (!result.success) {
      setStatus(result.error || "Fund state unavailable");
      return;
    }
    try {
      const parsed = JSON.parse(String(result.data));
      setStats({
        budget: String(parsed.budget || "0"),
        dryPowder: String(parsed.dry_powder || "0"),
        deployed: String(parsed.deployed || "0"),
        startups: String(parsed.startup_count || "0"),
        portfolio: String(parsed.portfolio_count || "0"),
      });
      setStatus("Fund state refreshed from contract.");
    } catch {
      setStatus("Fund state returned non-json data.");
    }
  }

  async function initializeFund() {
    setBusy(true);
    setStatus("Initializing DAO fund mandate...");
    const result = await writeContract("initialize", [
      wallet || deal.wallet,
      BigInt(2000000),
      BigInt(350000),
      BigInt(80),
    ]);
    setBusy(false);
    setStatus(result.success ? `Fund initialized. Tx ${shortAddress(result.hash)}` : result.error || "Initialize failed");
    if (result.success) await refreshFund();
  }

  async function sourceStartup() {
    setBusy(true);
    setStatus("Sourcing startup into DAO pipeline...");
    const result = await writeContract("source_startup", [
      deal.name,
      deal.wallet,
      deal.sector,
      BigInt(deal.requestedTicket || "0"),
      deal.productUrl,
      deal.docsUrl,
    ]);
    setBusy(false);
    setStatus(result.success ? `Startup sourced. Tx ${shortAddress(result.hash)}` : result.error || "Source failed");
    if (result.success) await refreshFund();
  }

  async function attachEvidence() {
    setBusy(true);
    setStatus("Attaching diligence evidence chips...");
    const result = await writeContract("attach_more_evidence", [
      BigInt(deal.startupId || "0"),
      deal.founderUrl,
      deal.codeUrl,
      deal.marketUrl,
    ]);
    setBusy(false);
    setStatus(result.success ? `Evidence attached. Tx ${shortAddress(result.hash)}` : result.error || "Evidence attach failed");
  }

  async function runDiligence() {
    setBusy(true);
    setStatus("Running GenLayer AI due diligence...");
    const result = await writeContract("run_due_diligence", [BigInt(deal.startupId || "0")]);
    setBusy(false);
    setStatus(result.success ? `Diligence finalized. ${String(result.data || result.status || "finalized")}` : result.error || "Diligence failed");
    if (result.success) {
      const read = await readContract("get_diligence", [BigInt(deal.startupId || "0")]);
      if (read.success) {
        setMemo(String(read.data));
      }
      await refreshFund();
    }
  }

  async function issueTermSheet() {
    setBusy(true);
    setStatus("Issuing autonomous term sheet...");
    const result = await writeContract("issue_term_sheet", [BigInt(deal.startupId || "0")]);
    setBusy(false);
    setStatus(result.success ? `Term sheet ready. Tx ${shortAddress(result.hash)}` : result.error || "Term sheet failed");
    if (result.success) await refreshFund();
  }

  async function fundStartup() {
    setBusy(true);
    setStatus("Funding startup from DAO treasury...");
    const result = await writeContract("fund_startup", [BigInt(deal.startupId || "0")]);
    setBusy(false);
    setStatus(result.success ? `Portfolio position funded. Tx ${shortAddress(result.hash)}` : result.error || "Funding failed");
    if (result.success) await refreshFund();
  }

  return (
    <main className="page">
      <nav className="nav">
        <a className="brand" href="#top">
          <span className="mark"><Landmark size={22} /></span>
          VC-DAO Alpha
        </a>
        <div className="nav-links">
          <a href="#mandate">Mandate</a>
          <a href="#deal-room">Deal room</a>
          <a href="#memo">AI memo</a>
        </div>
        <button className="button-ghost" type="button" onClick={handleConnect}>
          <Wallet size={18} />
          {wallet ? shortAddress(wallet) : "Connect wallet"}
        </button>
      </nav>

      <section className="hero" id="top">
        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <span className="eyebrow"><Sparkles size={16} /> Autonomous seed fund on GenLayer</span>
          <h1>
            The DAO that finds alpha before the meeting starts.
          </h1>
          <p>
            VC-DAO Alpha reads startup launch pages, docs, founder profiles, code and market signals,
            then runs AI due diligence inside a GenLayer Intelligent Contract before issuing investment offers.
          </p>
          <div className="hero-actions">
            <a className="button" href="#deal-room">Open deal room <ArrowRight size={18} /></a>
            <button className="button-ghost" type="button" onClick={refreshFund}>Refresh fund state <Gauge size={18} /></button>
          </div>
          <div className="ticker">
            <span>Dry powder: ${stats.dryPowder}</span>
            <span>Sourced: {stats.startups}</span>
            <span>Deployed: ${stats.deployed}</span>
            <span>Portfolio: {stats.portfolio}</span>
          </div>
        </motion.div>

        <motion.div className="radar-shell" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <div className="radar-grid" />
          <div className="radar-core">DAO<br />JURY</div>
          {nodes.map(([name, sector, klass]) => (
            <div className={`deal-node ${klass}`} key={name}>
              <strong>{name}</strong>
              <span>{sector} signal detected</span>
            </div>
          ))}
          <div className="radar-memo">
            <small>Latest investment thesis</small>
            <strong>Back software that compounds distribution before capital.</strong>
          </div>
        </motion.div>
      </section>

      <section className="section" id="mandate">
        <div className="section-heading">
          <h2>Fund mandate, not another setup form.</h2>
          <p>Choose a thesis visually, initialize capital once, then let the contract score every deal against the mandate.</p>
        </div>
        <div className="mandate">
          <div className="mandate-cell">
            <span>Thesis sectors</span>
            <div className="sector-row">
              {sectors.map((sector) => (
                <button key={sector} type="button" onClick={() => updateDeal("sector", sector)}>{sector}</button>
              ))}
            </div>
          </div>
          <div className="mandate-cell">
            <span>Fund size</span>
            <strong>$2,000,000</strong>
          </div>
          <div className="mandate-cell">
            <span>Max ticket</span>
            <strong>$350,000</strong>
          </div>
          <button className="button" type="button" disabled={busy} onClick={initializeFund}>
            Initialize fund <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="deal-room" id="deal-room">
        <div className="section">
          <div className="section-heading">
            <h2>Deal room cockpit</h2>
            <p>Startup data is entered as cards and evidence chips, so the interface feels like a VC pipeline instead of an admin form.</p>
          </div>

          <div className="deal-layout">
            <div className="deal-stack">
              <article className="deal-card active">
                <div className="deal-top">
                  <div className="deal-title">
                    <input aria-label="Startup name" value={deal.name} onChange={(event) => updateDeal("name", event.target.value)} />
                    <div className="deal-sector"><BriefcaseBusiness size={15} /> {deal.sector}</div>
                  </div>
                  <BadgeDollarSign size={34} />
                </div>
                <div className="ticket-rail"><div /></div>
                <div className="compact-grid">
                  <div className="compact-input">
                    <label>Founder wallet</label>
                    <input value={deal.wallet} onChange={(event) => updateDeal("wallet", event.target.value)} />
                  </div>
                  <div className="compact-input">
                    <label>Requested ticket</label>
                    <input value={deal.requestedTicket} onChange={(event) => updateDeal("requestedTicket", event.target.value)} />
                  </div>
                  <div className="compact-input">
                    <label>Sector</label>
                    <input value={deal.sector} onChange={(event) => updateDeal("sector", event.target.value)} />
                  </div>
                  <div className="compact-input">
                    <label>Startup ID</label>
                    <input value={deal.startupId} onChange={(event) => updateDeal("startupId", event.target.value)} />
                  </div>
                </div>
                <div className="actions">
                  <button className="button-dark" type="button" disabled={busy} onClick={sourceStartup}>Source startup <Rocket size={18} /></button>
                </div>
              </article>

              <article className="evidence-dock">
                <h3>Evidence dock</h3>
                <div className="chip-grid">
                  <div className="source-chip"><span><Globe2 size={15} /> Product</span><input value={deal.productUrl} onChange={(event) => updateDeal("productUrl", event.target.value)} /></div>
                  <div className="source-chip"><span><FileText size={15} /> Docs</span><input value={deal.docsUrl} onChange={(event) => updateDeal("docsUrl", event.target.value)} /></div>
                  <div className="source-chip"><span><UserRoundSearch size={15} /> Founder</span><input value={deal.founderUrl} onChange={(event) => updateDeal("founderUrl", event.target.value)} /></div>
                  <div className="source-chip"><span><GitBranch size={15} /> Code</span><input value={deal.codeUrl} onChange={(event) => updateDeal("codeUrl", event.target.value)} /></div>
                  <div className="source-chip"><span><Link2 size={15} /> Market</span><input value={deal.marketUrl} onChange={(event) => updateDeal("marketUrl", event.target.value)} /></div>
                </div>
                <div className="actions">
                  <button className="button" type="button" disabled={busy} onClick={attachEvidence}>Attach chips <Cable size={18} /></button>
                  <button className="button-dark" type="button" disabled={busy} onClick={runDiligence}>Run AI diligence <BrainCircuit size={18} /></button>
                </div>
              </article>
            </div>

            <div>
              <article className="memo" id="memo">
                <h3>AI investment memo</h3>
                <div className="memo-score">
                  <div className="score-ring"><strong>78</strong></div>
                  <p className="memo-copy">{memo}</p>
                </div>
                <div className="score-bars">
                  <div className="bar"><span>Market urgency</span><div className="bar-track"><div style={{ width: "82%" }} /></div></div>
                  <div className="bar"><span>Technical feasibility</span><div className="bar-track"><div style={{ width: "74%" }} /></div></div>
                  <div className="bar"><span>Team credibility</span><div className="bar-track"><div style={{ width: "68%" }} /></div></div>
                  <div className="bar"><span>Risk control</span><div className="bar-track"><div style={{ width: "57%" }} /></div></div>
                </div>
                <div className="actions">
                  <button className="button" type="button" disabled={busy} onClick={issueTermSheet}>Issue term sheet <ShieldCheck size={18} /></button>
                  <button className="button-dark" type="button" disabled={busy} onClick={fundStartup}>Fund startup <CircleDollarSign size={18} /></button>
                </div>
                <div className="status-strip">
                  <strong>{configured ? "Contract configured" : "Contract address pending"}</strong>
                  <br />
                  {status}
                </div>
              </article>

              <article className="deal-card ledger">
                <h3>Portfolio ledger</h3>
                <div className="ledger-row"><span>Budget</span><strong>${stats.budget}</strong><BadgeDollarSign size={18} /></div>
                <div className="ledger-row"><span>Dry powder</span><strong>${stats.dryPowder}</strong><Radar size={18} /></div>
                <div className="ledger-row"><span>Deployed</span><strong>${stats.deployed}</strong><Landmark size={18} /></div>
                <div className="ledger-row"><span>Portfolio positions</span><strong>{stats.portfolio}</strong><BriefcaseBusiness size={18} /></div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
