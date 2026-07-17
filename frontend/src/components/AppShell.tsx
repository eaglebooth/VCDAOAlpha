"use client";

import { ExternalLink, Landmark, Menu, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useContractAddress } from "./ContractProvider";
import { useWallet } from "./WalletProvider";

const links = [["How it works", "/how-it-works"], ["Fund", "/fund"], ["Startups", "/startups"], ["Portfolio", "/portfolio"], ["Review", "/review"], ["Contract", "/contract"]];
const short = (value: string) => value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "V3 pending";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { address: wallet, busy, connect } = useWallet();
  const { address: contract, overridden } = useContractAddress();
  const [open, setOpen] = useState(false);
  return <main className="page">
    <nav className="nav">
      <Link className="brand" href="/"><span><Landmark size={21} /></span>VCDAO <b>Alpha</b></Link>
      <div className="nav-links">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div>
      <div className="nav-tools">
        <Link className="contract-pill" href="/contract" title={overridden ? "Browser-local contract override" : "Production contract"}>{short(contract)}{overridden ? " local" : ""}<ExternalLink size={12} /></Link>
        <button className="wallet-button" onClick={connect} disabled={busy}><Wallet size={16} />{wallet ? short(wallet) : busy ? "Connecting" : "Connect wallet"}</button>
      </div>
      <button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
    </nav>
    {open && <div className="mobile-nav">{links.map(([label, href]) => <Link href={href} onClick={() => setOpen(false)} key={href}>{label}</Link>)}</div>}
    {children}
    <footer><strong>VCDAO Alpha V3</strong><span>Evidence diligence. Founder consent. Real treasury settlement.</span></footer>
  </main>;
}
