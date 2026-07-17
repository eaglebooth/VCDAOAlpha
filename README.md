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
- A runtime contract page lets reviewers verify their deployment without rebuilding.
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

Status: `DEPLOYED_WRITE_VERIFIED_PARTIAL`. The V3 Studionet deployment is configured
at `0x880F7Dd613e5B746079Ac4cb0311FbFD03Fba8bF`. A live initialization write and its
post-state read passed on 2026-07-17. The remaining startup, diligence, offer,
settlement, failure-path, and Explorer evidence must still pass before submission.

Frontend configuration:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x880F7Dd613e5B746079Ac4cb0311FbFD03Fba8bF
NEXT_PUBLIC_NETWORK=studionet
NEXT_PUBLIC_GENLAYER_RPC=
```

No claim of end-to-end execution is made until every required write is exercised on
the new deployment and recorded in `docs/release-evidence.md`.
