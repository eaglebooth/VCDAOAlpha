# VCDAO Alpha V3

VCDAO Alpha is an evidence-driven seed fund on GenLayer. Founders submit public
product, documentation, identity, code, and market evidence. An Intelligent
Contract performs semantic due diligence, reserves a qualified ticket, requires
founder acceptance, and transfers treasury GEN when the manager executes the
investment.

**Pitch:** VCDAO Alpha cannot operate without GenLayer because a subjective
investment judgment over live evidence directly controls real on-chain capital.

## V3 repair

- Frontend writes wait for `TransactionStatus.ACCEPTED`, avoiding the Studionet
  finalization timeout reported by reviewers.
- Receipt handling distinguishes explicit execution errors from missing SDK
  metadata. Missing metadata requires post-write state verification.
- Every action captures pre-state and refuses to report success unless the affected
  on-chain state changes.
- Every write now runs a live role, status, and fund-limit preflight before opening
  the wallet, then links to the next valid lifecycle page after verified state change.
- A runtime contract page lets reviewers verify their deployment without rebuilding.
- `/review` reads the active deployment and exposes the exact reviewer test path,
  wallet-role matrix, lifecycle progress, and Explorer link.
- Startup duplicate detection uses `TreeMap[str, u256]` instead of scanning all prior
  candidates in a write transaction.
- The active V3 Studionet deployment is runtime-selectable and can be verified from `/contract`.

## Contract lifecycle

1. `initialize` receives initial GEN and authenticates the fund manager.
2. `source_startup` binds a candidate to its founder wallet.
3. `attach_evidence` records founder, code, and market sources.
4. `run_due_diligence` reads five sources and reaches semantic consensus.
5. `issue_term_sheet` reserves an approved ticket.
6. `accept_term_sheet` records founder consent.
7. `execute_investment` transfers GEN and creates a portfolio position.
8. `cancel_term_sheet` releases an unexecuted reserve.

## Frontend routes

- `/fund`, `/fund/initialize`, `/fund/deposit`, `/fund/withdraw`
- `/startups`, `/startups/submit`, `/startups/[id]`
- `/startups/[id]/evidence`, `/diligence`, `/term-sheet`, `/accept`, `/execute`, `/cancel`
- `/portfolio`
- `/review` live submission-readiness checklist and next-action routing
- `/contract` runtime deployment verification
- `/how-it-works`

## Local verification

```powershell
python -B -m unittest discover -s tests -v
python -c "import ast; ast.parse(open('contracts/VCDAOAlpha.py', encoding='utf-8').read())"
cd frontend
npm run test:receipt
npm run lint
npm run build
npm run dev -- -p 3039
```

## Deployment status

Status: `RUNTIME_VERIFIED_READY_FOR_PRODUCTION`. The active Studionet deployment is
`0x0B26B71d8B043039893182211211085Ef9e8619B`. Its schema exposes all 14 methods and
the signed release run completed on 2026-07-17. The run proved payable treasury
initialization, founder-authenticated sourcing and evidence, both `NEEDS_REVIEW` and
`APPROVED` AI decisions, reserve accounting, term-sheet acceptance, a finalized
100 wei recipient transfer, portfolio creation, deposit/withdraw transfers, duplicate
protection, manager authorization, and overdraw protection. Exact transactions and
before/after state are recorded in `docs/release-evidence.md`.

Frontend configuration:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0B26B71d8B043039893182211211085Ef9e8619B
NEXT_PUBLIC_NETWORK=studionet
NEXT_PUBLIC_GENLAYER_RPC=
```

All frontend environment templates point to the runtime-verified deployment.

## Required signed release run

The following release flow has been completed on the active deployment:

1. A founder wallet sources one real startup with a ticket at or below `250` wei.
2. The same founder wallet attaches public product, documentation, identity, code,
   and independent market evidence.
3. Run AI diligence and retain the transaction hash plus resulting memo.
4. If approved, the manager issues terms, the founder accepts, and the manager
   executes settlement. Confirm the founder balance transfer and portfolio record.
5. Record every hash and before/after state in `docs/release-evidence.md`.

The app deliberately blocks wrong-role and wrong-status actions before wallet
signature. Reviewers can begin at `/review` and follow the live next-step button.
