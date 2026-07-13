import Link from "next/link";
import { ArrowRight, BrainCircuit, CircleDollarSign, Radar, Scale, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { FundSnapshot } from "@/components/FundSnapshot";

const steps = [
  [Radar, "Founder-owned pipeline", "Every candidate is bound to the submitting wallet and immutable public evidence."],
  [BrainCircuit, "Semantic diligence", "Validators compare the investment conclusion, risk band, and eligible ticket, not memo wording."],
  [Scale, "Two-party term sheet", "The manager reserves capital; the authenticated founder must accept before execution."],
  [CircleDollarSign, "Real on-chain investment", "Accepted offers transfer actual treasury GEN to the founder and create a portfolio position."],
] as const;

export default function Home() {
  return <>
    <section className="hero">
      <Reveal className="hero-copy">
        <span className="eyebrow"><ShieldCheck size={15}/> Autonomous venture treasury</span>
        <h1>Find conviction.<br/><em>Fund evidence.</em></h1>
        <p>VCDAO Alpha turns public startup signals into a validator-reviewed investment decision, then settles an accepted seed offer directly from an on-chain treasury.</p>
        <div className="button-row"><Link className="primary-button" href="/startups/submit">Submit a startup <ArrowRight size={17}/></Link><Link className="quiet-button" href="/how-it-works">Explore the protocol</Link></div>
      </Reveal>
      <Reveal className="orbit" delay={0.12}>
        <div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/><div className="orbit-core"><BrainCircuit/><strong>AI IC</strong><span>evidence jury</span></div>
        <span className="orbit-node node-a">Founder</span><span className="orbit-node node-b">Public web</span><span className="orbit-node node-c">Treasury</span>
      </Reveal>
    </section>
    <FundSnapshot />
    <section className="section">
      <Reveal className="section-title"><span>Investment lifecycle</span><h2>Capital moves only after every gate is proven.</h2></Reveal>
      <div className="step-grid">{steps.map(([Icon,title,copy],i)=><Reveal className="step" delay={i*.06} key={title}><div className="step-number">0{i+1}</div><Icon/><h3>{title}</h3><p>{copy}</p></Reveal>)}</div>
    </section>
    <section className="cta-band"><div><span>Built for accountable capital</span><h2>No meetings pretending to be diligence.</h2></div><Link className="light-button" href="/startups">Open deal pipeline <ArrowRight size={17}/></Link></section>
  </>;
}
