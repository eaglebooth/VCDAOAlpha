# VC-DAO Alpha

An autonomous GenLayer venture DAO that sources startups from public web evidence, runs AI due diligence, and issues on-chain seed investment offers from a DAO treasury.

**One-line pitch:** VC-DAO Alpha dies without GenLayer because seed investment decisions require subjective AI due diligence over live public startup evidence, then trigger an on-chain investment offer from a DAO treasury.

## Why GenLayer

DAO investment committees are slow, political, and usually not equipped to read every pitch deck, repo, founder profile, and launch signal. A deterministic smart contract can hold funds, but it cannot judge whether a startup is credible, technically feasible, and worth funding.

VC-DAO Alpha uses a GenLayer Intelligent Contract to:

- Store a seed fund mandate, budget, max ticket size, and score threshold.
- Source startup candidates with product/docs URLs.
- Attach founder, code, and market evidence.
- Read evidence on-chain through `gl.nondet.web.render`.
- Run AI due diligence through `gl.nondet.exec_prompt`.
- Reserve capital, issue term sheets, and record funded portfolio positions.

## Deployed Contract

```text
0x4C3871F3070eD5A6417D2eFd85B46e236B9A425B
```

## Live App

https://vcdao-alpha.vercel.app

## Project Structure

```text
VCDAOAlpha/
  contracts/
    VCDAOAlpha.py
  frontend/
    src/app/page.tsx
    src/lib/genlayer.ts
  scripts/deploy/deploy.ps1
  tests/test_contract_static.py
```

## Contract Flow

1. Initialize fund mandate.
2. Source startup.
3. Attach founder/code/market evidence.
4. Run AI due diligence.
5. Approved startups become term-sheet ready.
6. Funded startups are recorded as portfolio positions.

## Pre-Deploy Verification

```powershell
python -m unittest discover -s tests
python -c "import ast; ast.parse(open('contracts/VCDAOAlpha.py', encoding='utf-8').read())"
genlayer lint contracts/VCDAOAlpha.py
```

## Frontend Setup

```powershell
cd frontend
npm install
copy .env.example .env.local
npm run dev -- --port 3039
```

Set the deployed contract address:

```text
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed-vcdaoalpha-address>
NEXT_PUBLIC_NETWORK=studionet
NEXT_PUBLIC_GENLAYER_RPC=
```

## Demo Flow

1. Connect wallet.
2. Initialize fund mandate.
3. Open a startup deal card.
4. Attach evidence chips.
5. Run AI due diligence.
6. Issue a term sheet and fund the portfolio position.
