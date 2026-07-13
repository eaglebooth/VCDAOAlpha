# VCDAO Alpha V2

VCDAO Alpha is an evidence-driven autonomous seed fund on GenLayer. Founders
submit public product, documentation, identity, code, and market evidence. An
Intelligent Contract performs semantic AI due diligence, reserves a qualified
ticket, requires founder acceptance, and transfers real treasury GEN when the
fund manager executes the investment.

**Pitch:** VCDAO Alpha cannot operate without GenLayer because subjective
investment eligibility over live public evidence directly controls real,
on-chain venture capital.

## What V2 fixes

- The treasury is funded with transaction value instead of a bookkeeping number.
- Fund manager and founder permissions derive from `gl.message.sender_address`.
- AI diligence uses `prompt_comparative` for semantic decision consensus.
- Evidence uses the current `web.render(url, mode="html")` interface.
- Term sheets reserve real capital and require founder acceptance.
- Investment execution transfers GEN to the recorded founder wallet.
- Offer and portfolio records use separate storage and preserve value conservation.
- The frontend uses `genlayer-js`, waits for a successful finalized receipt, and
  reads contract state back after every write.

## Contract lifecycle

1. `initialize` receives initial GEN and authenticates the fund manager.
2. `source_startup` binds a candidate to its founder wallet.
3. `attach_evidence` anchors founder, code, and market sources.
4. `run_due_diligence` reads five web sources and reaches semantic consensus.
5. `issue_term_sheet` reserves an approved ticket against a terms URL.
6. `accept_term_sheet` records founder consent.
7. `execute_investment` transfers GEN and creates a portfolio position.
8. `cancel_term_sheet` releases an unexecuted reserve.

## Frontend routes

- `/fund` treasury state and manager operations
- `/startups` live candidate directory
- `/startups/submit` founder-owned submission
- `/startups/[id]/evidence` evidence attachment
- `/startups/[id]/diligence` GenLayer jury review
- `/startups/[id]/term-sheet` reserve and publish offer
- `/startups/[id]/accept` founder consent
- `/startups/[id]/execute` real investment settlement
- `/portfolio` live funded positions
- `/how-it-works` complete protocol walkthrough

## Local verification

```powershell
python -B -m unittest discover -s tests -v
python -c "import ast; ast.parse(open('contracts/VCDAOAlpha.py', encoding='utf-8').read())"
cd frontend
npm install
npm run lint
npm run build
npm run dev -- -p 3039
```

## Deployment status

VCDAO Alpha V2 is deployed on GenLayer Studio / Studionet at:

```text
0xfD2ACFA789324513374400E29021C652B3a2e276
```

All frontend environments use this address for live `genlayer-js` reads and
writes:

```text
NEXT_PUBLIC_CONTRACT_ADDRESS=0xfD2ACFA789324513374400E29021C652B3a2e276
NEXT_PUBLIC_NETWORK=studionet
NEXT_PUBLIC_GENLAYER_RPC=
```
