# VCDAO Alpha V3 Release Evidence

Current status: `DEPLOYED_WRITE_VERIFIED_PARTIAL`

Active V3 Studionet deployment: `0x880F7Dd613e5B746079Ac4cb0311FbFD03Fba8bF`.
Runtime gates remain blocked until live reads and writes are recorded below.

| Gate | Status | Fresh evidence |
|---|---|---|
| Toolchain | PASS | Runner `v0.2.16`; pinned py-genlayer header; `genlayer-js` 1.1.8; target `studionet` |
| Contract schema | PASS | Frontend called `get_fund_state` on the configured V3 address and received the expected V3 state shape on 2026-07-17 |
| Contract static checks | PASS | 12 Python static/regression tests pass; contract AST parses successfully on 2026-07-17 |
| Frontend receipt tests | PASS | 4/4 pure receipt-classification tests pass, including missing metadata and `NOT_VOTED` |
| Frontend lint/build | PASS | ESLint passes; Next.js 16.2.6 production build generates all 18 application routes |
| Local browser walkthrough | PASS | Home, runtime contract selector, and treasury initialization pages render on localhost with no browser console errors |
| Runtime writes | PARTIAL | `initialize` passed with authenticated manager; execute and record the remaining writes |
| State proof | PARTIAL | Initialization changed manager, received, available, max ticket and minimum score exactly as expected |
| Failure proof | PARTIAL | Invalid initialization (`capital=1`, `max_ticket=2`) reached ACCEPTED without changing state at transaction `0x3a0af9b78be207722aed75e93e1c3a1ea8051da022c5c8d903f90918b4fb0813`; remaining wrong-role, duplicate, zero-value and replay paths are required |
| Value proof | PARTIAL | Contract state records `1000` received and available after payable initialization; Explorer custody and founder transfer remain required |
| Consensus | BLOCKED | Execute `run_due_diligence` on V3 and record transaction/state |
| Address audit | PASS | V3 address is identical in local, example, and production frontend environments |
| Production | PASS | `https://vcdao-alpha.vercel.app/contract` loaded the configured V3 address and returned the initialized Studionet state on 2026-07-17 with no browser console errors |
| Provenance | BLOCKED | Verify founder/code/market evidence binding and document remaining source-authentication limits |
| Limitations | PASS | No deployed-runtime or production-success claim is made |

## Function execution ledger

Fill every row after V3 deployment. A transaction hash without post-state and
Explorer verification is not a pass.

| Function | Caller | Value | Pre-state | Transaction/read | Receipt | Post-state | Explorer | Status |
|---|---|---:|---|---|---|---|---|---|
| `initialize` | `0xeb57bc7125fa60d7482CE12058397369AB3581f8` | `1000` | uninitialized, available `0` | `0xf4296466757b8a9f0c6734f1c2f1b20a45f53ba7986bbc58a0fc078ef22d31bb` | ACCEPTED | manager set; received/available `1000`; max ticket `250`; score `80` | address and live state matched | PASS |
| `deposit_treasury` | fund manager | payable | pending | pending | pending | pending | pending | BLOCKED |
| `source_startup` | founder | 0 | pending | pending | pending | pending | pending | BLOCKED |
| `attach_evidence` | founder | 0 | pending | pending | pending | pending | pending | BLOCKED |
| `run_due_diligence` | any | 0 | pending | pending | pending | pending | pending | BLOCKED |
| `issue_term_sheet` | fund manager | 0 | pending | pending | pending | pending | pending | BLOCKED |
| `accept_term_sheet` | founder | 0 | pending | pending | pending | pending | pending | BLOCKED |
| `execute_investment` | fund manager | 0 | pending | pending | pending | pending | pending | BLOCKED |
| `cancel_term_sheet` | fund manager | 0 | pending | pending | pending | pending | pending | BLOCKED |
| `withdraw_unreserved` | fund manager | 0 | pending | pending | pending | pending | pending | BLOCKED |
| `get_fund_state` | public | 0 | n/a | Live frontend read after initialization | n/a | `available=1000`, `reserved=0`, `startup_count=0`, `portfolio_count=0` | address matched | PASS |
| other views | public | 0 | n/a | pending | n/a | n/a | pending | BLOCKED |

## Negative-path evidence

| Action | Input | Transaction | Expected result | Verified post-state | Status |
|---|---|---|---|---|---|
| `initialize` | capital `1`, max ticket `2`, score `80` | `0x3a0af9b78be207722aed75e93e1c3a1ea8051da022c5c8d903f90918b4fb0813` | `INVALID_MAX_TICKET` | manager empty; received, available and max ticket remain `0` | PASS |
