# VCDAO Alpha V3 Release Evidence

Current status: `RUNTIME_VERIFIED_READY_FOR_PRODUCTION`

Active Studionet deployment:
`0x0B26B71d8B043039893182211211085Ef9e8619B`

Verification date: 2026-07-17. The signed test key was provided ephemerally and was
not stored in the repository, environment files, scripts, or logs.

## Release gates

| Gate | Status | Fresh evidence |
|---|---|---|
| Contract schema | PASS | Deployment exposes all 14 expected methods |
| Contract tests | PASS | 13/13 Python static and regression tests; AST parses |
| Frontend tests | PASS | 13/13 receipt, preflight, role, lifecycle, and routing tests |
| Frontend quality | PASS | ESLint and Next.js 16.2.6 production build pass |
| Payable custody | PASS | Initialization received 1000 wei; deposit added 50 wei |
| Semantic consensus | PASS | Negative fixture became `NEEDS_REVIEW`; aligned fixture became `APPROVED` with score 92, risk 28, ticket 100 |
| Full investment flow | PASS | Offer reserved 100, founder accepted, settlement created portfolio position 0 |
| Real transfer | PASS | Parent and 100 wei child transfer finalized; recipient balance increased by 100 wei |
| Treasury withdrawal | PASS | 50 wei withdrawal emitted and finalized a child transfer |
| Authorization | PASS | Unrelated wallet could not issue terms; state remained unchanged |
| Input/lifecycle guards | PASS | Duplicate startup and 901 wei overdraw both preserved state |
| Address audit | PASS | Local, example, production env, README, and runtime deployment agree |
| Reviewer UX | PASS | Review Center, role matrix, live status, Explorer link, and next-step routing are implemented |
| Known limitation | DISCLOSED | Public URL allowlisting does not cryptographically prove ownership or authorship of off-chain evidence |

## Signed execution ledger

Caller/manager/founder fixture:
`0xeb57bc7125fa60d7482CE12058397369AB3581f8`

| Function | Transaction | Verified result |
|---|---|---|
| `initialize(250,80)` + 1000 wei | `0x0e1fca96854cd17d7a7732f187879fd179c33af3b1d1511303b95ce3d4ae0e26` | Manager set; received/available 1000; max ticket 250; score 80 |
| `source_startup` negative fixture | `0xcce21b58c5ba78fdf3368f235ee6d280d0d4fb92d10c7516cfcece551b963c10` | Startup 0 stored as `SOURCED` |
| `attach_evidence` negative fixture | `0xc1e916ca0041ef40cc6ed4b35b67f6d1402b6cd89831ceeb4949f37c8121d1ff` | Startup 0 moved to `EVIDENCE_READY` |
| `run_due_diligence(0)` | `0x164a7e5b082d24d3120abb787607feac9c3b7b084ef835c839579b4b0888bef1` | `NEEDS_REVIEW`, score 52, risk 42, ticket 0; readable sources survived one unavailable page |
| `source_startup` aligned fixture | `0xba48d2bce685f171db49a919cb5228a294bfe5d3e3d0db858eb1b271ccc6eb2f` | Startup 1 stored as `SOURCED` |
| `attach_evidence` aligned fixture | `0x907914bb0217ba9484cc9638305ef856a023f3cd79df8a4f4c35cec8874023fd` | Startup 1 moved to `EVIDENCE_READY` |
| `run_due_diligence(1)` | `0x2914fddf881a869d71f1e8a0d100e983afd685fce6cbb93bf0b206a31cf4bd0e` | `APPROVED`, score 92, risk 28, recommended ticket 100 |
| `issue_term_sheet(1)` | `0x575263188be573c24600d8115d0537c8f8dd05a2970a196acf2b91e4b75c68cb` | Status `OFFERED`; reserved 100; available 900 |
| `accept_term_sheet(1)` | `0x69727bc68d09e8d65f1edca95234cc5b426c684c230874cb463fcf11e0db392e` | Founder-authenticated status `ACCEPTED` |
| `execute_investment(1)` | `0x5e59f7052750467c2894b57ee436c08167d34cf4e927db3d32e9c1fadbe6e803` | Parent finalized; status `FUNDED`; deployed 100; portfolio 0 created |
| Settlement child transfer | `0xf19335bec0ab4cf414912bc4e892872075f35ce48db407c7178fafa915daddba` | Finalized 100 wei transfer; recipient balance increased from 99999999999999990999 to 99999999999999991099 |
| `deposit_treasury()` + 50 wei | `0x5fc9e71c5e5281e6075131601d4b31e27b0600ba9203dbc50f9887a1b79e5001` | Received 1050; available 950 |
| `withdraw_unreserved(50)` | `0x6c8290f37c7078905302648bd9b2f50c32e3d7d8a18b08a0732e362367d1adbe` | Finalized; withdrawn 50; available returned to 900 |
| Withdrawal child transfer | `0x2d4d053f3ee2715111f861d0b3327e2423f426884a9679b9e894933d361918bc` | Finalized recipient transfer |

Final fund state:

```json
{"available":"900","deployed":"100","manager":"0xeb57bc7125fa60d7482CE12058397369AB3581f8","max_ticket":"250","min_score":"80","portfolio_count":"1","received":"1050","reserved":"0","startup_count":"2","withdrawn":"50"}
```

Portfolio position 0:

```json
{"amount":"100","portfolio_id":"0","startup_id":"1","terms_url":"https://github.com/eaglebooth/VCDAOAlpha/blob/main/docs/release-evidence.md"}
```

## Negative-path evidence

| Action | Transaction | Expected guard | Verified state |
|---|---|---|---|
| Source duplicate founder/name | `0x0341123bc22cc46d2400709da5c1ea3721e85d7d3e2b98c9738232d4e3944622` | `STARTUP_ALREADY_SOURCED` | Startup count remained 2 |
| Outsider issues term sheet | `0xcb14cc114a033a963e364b78cde0a63e654cf6cb050f528b2e344fe049a1af79` | `NOT_FUND_MANAGER` | Fund and startup state unchanged |
| Withdraw 901 with 900 available | `0x09f51f718f57a5bf4468f0785c897e6e7d78182c7eb73f13aa15738d02fc6b1a` | `INVALID_WITHDRAWAL` | Available and withdrawn remained 900 and 50 |

## Superseded deployments

- `0x16E1EBadA76b6661543325cd71D1F154b2F26583`: one failed URL masked all other evidence.
- `0x0974451Bff813f23f1CFE471908437a6932B4948`: HTML evidence polluted the jury context.
- `0x0F44B4E13f77Dfa9b517513164800614A64436a9`: unstructured AI output failed parsing.
- `0x3c43f0A948Ce9bD3659FA360448cF9533907ab24`: over-constrained equivalence caused `NO_MAJORITY`.
- `0x880F7Dd613e5B746079Ac4cb0311FbFD03Fba8bF`: missing TreeMap key caused a write failure.
