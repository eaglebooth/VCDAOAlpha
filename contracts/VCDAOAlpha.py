# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import typing
import json


class VCDAOAlpha(gl.Contract):
    fund_config: TreeMap[u256, str]
    fund_budget: u256
    fund_reserved: u256
    fund_deployed: u256
    max_ticket: u256
    min_score: u256

    startup_count: u256
    startup_name: TreeMap[u256, str]
    startup_wallet: TreeMap[u256, str]
    startup_sector: TreeMap[u256, str]
    startup_requested_ticket: TreeMap[u256, u256]
    startup_product_url: TreeMap[u256, str]
    startup_docs_url: TreeMap[u256, str]
    startup_founder_url: TreeMap[u256, str]
    startup_code_url: TreeMap[u256, str]
    startup_market_url: TreeMap[u256, str]
    startup_status: TreeMap[u256, str]

    startup_score: TreeMap[u256, u256]
    startup_risk_score: TreeMap[u256, u256]
    startup_recommended_ticket: TreeMap[u256, u256]
    startup_valuation_cap: TreeMap[u256, u256]
    startup_decision: TreeMap[u256, str]
    startup_ai_memo: TreeMap[u256, str]

    portfolio_count: u256
    portfolio_startup_id: TreeMap[u256, u256]
    portfolio_amount: TreeMap[u256, u256]
    portfolio_terms: TreeMap[u256, str]

    def __init__(self):
        self.fund_budget = u256(0)
        self.fund_reserved = u256(0)
        self.fund_deployed = u256(0)
        self.max_ticket = u256(0)
        self.min_score = u256(0)
        self.startup_count = u256(0)
        self.portfolio_count = u256(0)

    def truncate(self, value: str, limit: u256) -> str:
        if len(value) > int(limit):
            return value[: int(limit)] + "...[TRUNCATED]"
        return value

    def clamp_score(self, value: typing.Any) -> u256:
        parsed = int(value)
        if parsed < 0:
            return u256(0)
        if parsed > 100:
            return u256(100)
        return u256(parsed)

    @gl.public.write
    def initialize(self, owner: str, budget: u256, max_seed_ticket: u256, minimum_score: u256) -> str:
        already_initialized = False
        try:
            if len(self.fund_config[u256(0)]) > 0:
                already_initialized = True
        except Exception:
            pass
        if already_initialized:
            return "ALREADY_INITIALIZED"
        if len(owner) == 0:
            return "INVALID_OWNER"
        if budget == u256(0):
            return "INVALID_BUDGET"
        if max_seed_ticket == u256(0):
            return "INVALID_MAX_TICKET"
        if minimum_score == u256(0) or minimum_score > u256(100):
            return "INVALID_MIN_SCORE"
        if max_seed_ticket > budget:
            return "MAX_TICKET_EXCEEDS_BUDGET"

        self.fund_config[u256(0)] = owner
        self.fund_config[u256(1)] = "AI_INFRA_DEVTOOLS_WEB3"
        self.fund_budget = budget
        self.max_ticket = max_seed_ticket
        self.min_score = minimum_score
        return "INITIALIZED"

    @gl.public.write
    def source_startup(
        self,
        name: str,
        wallet: str,
        sector: str,
        requested_ticket: u256,
        product_url: str,
        docs_url: str,
    ) -> typing.Any:
        fund_owner = ""
        try:
            fund_owner = self.fund_config[u256(0)]
        except Exception:
            pass
        if len(fund_owner) == 0:
            return "FUND_NOT_INITIALIZED"
        if len(name) == 0:
            return "INVALID_NAME"
        if len(wallet) == 0:
            return "INVALID_WALLET"
        if len(sector) == 0:
            return "INVALID_SECTOR"
        if requested_ticket == u256(0):
            return "INVALID_TICKET"
        if requested_ticket > self.max_ticket:
            return "REQUEST_EXCEEDS_MAX_TICKET"
        if len(product_url) < 4 or product_url[:4] != "http":
            return "INVALID_PRODUCT_URL"
        if len(docs_url) < 4 or docs_url[:4] != "http":
            return "INVALID_DOCS_URL"

        startup_id = self.startup_count
        self.startup_name[startup_id] = name
        self.startup_wallet[startup_id] = wallet
        self.startup_sector[startup_id] = sector
        self.startup_requested_ticket[startup_id] = requested_ticket
        self.startup_product_url[startup_id] = product_url
        self.startup_docs_url[startup_id] = docs_url
        self.startup_founder_url[startup_id] = ""
        self.startup_code_url[startup_id] = ""
        self.startup_market_url[startup_id] = ""
        self.startup_status[startup_id] = "SOURCED"
        self.startup_score[startup_id] = u256(0)
        self.startup_risk_score[startup_id] = u256(0)
        self.startup_recommended_ticket[startup_id] = u256(0)
        self.startup_valuation_cap[startup_id] = u256(0)
        self.startup_decision[startup_id] = ""
        self.startup_ai_memo[startup_id] = ""
        self.startup_count = startup_id + u256(1)
        return startup_id

    @gl.public.write
    def attach_more_evidence(
        self,
        startup_id: u256,
        founder_url: str,
        code_url: str,
        market_url: str,
    ) -> str:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self.startup_status[startup_id] != "SOURCED":
            return "INVALID_STATUS"
        if len(founder_url) < 4 or founder_url[:4] != "http":
            return "INVALID_FOUNDER_URL"
        if len(code_url) < 4 or code_url[:4] != "http":
            return "INVALID_CODE_URL"
        if len(market_url) < 4 or market_url[:4] != "http":
            return "INVALID_MARKET_URL"

        self.startup_founder_url[startup_id] = founder_url
        self.startup_code_url[startup_id] = code_url
        self.startup_market_url[startup_id] = market_url
        self.startup_status[startup_id] = "EVIDENCE_READY"
        return "EVIDENCE_READY"

    @gl.public.write
    def run_due_diligence(self, startup_id: u256) -> str:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self.startup_status[startup_id] != "EVIDENCE_READY":
            return "EVIDENCE_NOT_READY"

        name = self.startup_name[startup_id]
        sector = self.startup_sector[startup_id]
        requested_ticket = self.startup_requested_ticket[startup_id]
        product_url = self.startup_product_url[startup_id]
        docs_url = self.startup_docs_url[startup_id]
        founder_url = self.startup_founder_url[startup_id]
        code_url = self.startup_code_url[startup_id]
        market_url = self.startup_market_url[startup_id]
        min_required = self.min_score
        max_allowed_ticket = self.max_ticket

        def run() -> str:
            try:
                product_resp = gl.nondet.web.render(product_url, media_type="html")
                docs_resp = gl.nondet.web.render(docs_url, media_type="html")
                founder_resp = gl.nondet.web.render(founder_url, media_type="html")
                code_resp = gl.nondet.web.render(code_url, media_type="html")
                market_resp = gl.nondet.web.render(market_url, media_type="html")
                product = self.truncate(product_resp.body.decode("utf-8"), u256(1400))
                docs = self.truncate(docs_resp.body.decode("utf-8"), u256(1500))
                founder = self.truncate(founder_resp.body.decode("utf-8"), u256(1200))
                code = self.truncate(code_resp.body.decode("utf-8"), u256(1200))
                market = self.truncate(market_resp.body.decode("utf-8"), u256(1200))
            except Exception:
                return json.dumps({"error": "WEB_RENDER_FAILED"}, sort_keys=True, separators=(",", ":"))

            prompt = f"""
You are VC-DAO Alpha, an autonomous seed fund investment committee.

STARTUP: {name}
SECTOR: {sector}
REQUESTED SEED TICKET: {requested_ticket}
MAX FUND TICKET: {max_allowed_ticket}
MIN APPROVAL SCORE: {min_required}

PRODUCT / LAUNCH EVIDENCE:
{product}

WHITEPAPER / DOCS:
{docs}

FOUNDER PROFILE:
{founder}

CODE OR TECHNICAL EVIDENCE:
{code}

MARKET / SOCIAL PROOF:
{market}

TASK:
Perform subjective VC due diligence. Judge market urgency, traction, technical feasibility,
founder credibility, business/token model clarity, and downside risk. Recommend whether
this DAO should issue a seed investment offer.

SCORING:
- market_score 0-100
- traction_score 0-100
- technology_score 0-100
- team_score 0-100
- risk_score 0-100 where higher is worse
- overall_score 0-100

DECISION:
- APPROVED if overall_score >= {min_required}, risk_score <= 35, and recommended_ticket <= {max_allowed_ticket}
- NEEDS_REVIEW if evidence is promising but incomplete or risk is moderate
- REJECTED if traction is weak, team is not credible, tech is unclear, or risk_score > 65

Respond with ONLY strict JSON:
{{
  "decision": "APPROVED" | "NEEDS_REVIEW" | "REJECTED",
  "overall_score": 0,
  "market_score": 0,
  "traction_score": 0,
  "technology_score": 0,
  "team_score": 0,
  "risk_score": 0,
  "recommended_ticket": 0,
  "valuation_cap_hint": 0,
  "memo": "one concise investment memo"
}}
"""
            return gl.nondet.exec_prompt(prompt)

        consensus = gl.eq_principle.strict_eq(run)
        try:
            data = json.loads(consensus)
        except json.JSONDecodeError:
            return "INVALID_AI_RESPONSE"

        if "error" in data:
            return "WEB_RENDER_FAILED"

        decision = str(data.get("decision", "")).upper()
        if decision not in ["APPROVED", "NEEDS_REVIEW", "REJECTED"]:
            return "INVALID_DECISION"

        overall = self.clamp_score(data.get("overall_score", 0))
        risk = self.clamp_score(data.get("risk_score", 100))
        recommended_ticket = u256(int(data.get("recommended_ticket", 0)))
        valuation_cap = u256(int(data.get("valuation_cap_hint", 0)))

        if recommended_ticket > requested_ticket:
            recommended_ticket = requested_ticket
        if recommended_ticket > self.max_ticket:
            recommended_ticket = self.max_ticket
        if decision != "APPROVED":
            recommended_ticket = u256(0)
        if decision == "APPROVED":
            if overall < self.min_score or risk > u256(35):
                return "AI_DECISION_INCONSISTENT"
            remaining = self.fund_budget - self.fund_reserved - self.fund_deployed
            if recommended_ticket == u256(0) or recommended_ticket > remaining:
                return "INSUFFICIENT_DRY_POWDER"

        self.startup_score[startup_id] = overall
        self.startup_risk_score[startup_id] = risk
        self.startup_recommended_ticket[startup_id] = recommended_ticket
        self.startup_valuation_cap[startup_id] = valuation_cap
        self.startup_decision[startup_id] = decision
        self.startup_ai_memo[startup_id] = consensus

        if decision == "APPROVED":
            self.startup_status[startup_id] = "APPROVED"
        elif decision == "NEEDS_REVIEW":
            self.startup_status[startup_id] = "NEEDS_REVIEW"
        else:
            self.startup_status[startup_id] = "REJECTED"
        return decision

    @gl.public.write
    def issue_term_sheet(self, startup_id: u256) -> str:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self.startup_status[startup_id] != "APPROVED":
            return "NOT_APPROVED"

        ticket = self.startup_recommended_ticket[startup_id]
        if ticket == u256(0):
            return "INVALID_TICKET"
        remaining = self.fund_budget - self.fund_reserved - self.fund_deployed
        if ticket > remaining:
            return "INSUFFICIENT_DRY_POWDER"

        self.fund_reserved = self.fund_reserved + ticket
        self.startup_status[startup_id] = "TERM_SHEET_READY"
        return "TERM_SHEET_READY"

    @gl.public.write
    def fund_startup(self, startup_id: u256) -> typing.Any:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self.startup_status[startup_id] != "TERM_SHEET_READY":
            return "TERM_SHEET_NOT_READY"

        amount = self.startup_recommended_ticket[startup_id]
        if amount == u256(0):
            return "INVALID_AMOUNT"
        if amount > self.fund_reserved:
            return "RESERVE_MISMATCH"

        self.fund_reserved = self.fund_reserved - amount
        self.fund_deployed = self.fund_deployed + amount
        self.startup_status[startup_id] = "FUNDED"

        portfolio_id = self.portfolio_count
        self.portfolio_startup_id[portfolio_id] = startup_id
        self.portfolio_amount[portfolio_id] = amount
        terms = {
            "amount": str(amount),
            "startup_id": str(startup_id),
            "valuation_cap_hint": str(self.startup_valuation_cap[startup_id]),
            "wallet": self.startup_wallet[startup_id],
        }
        self.portfolio_terms[portfolio_id] = json.dumps(terms, sort_keys=True, separators=(",", ":"))
        self.portfolio_count = portfolio_id + u256(1)
        return portfolio_id

    @gl.public.view
    def get_fund_state(self) -> str:
        owner_addr = ""
        mandate_desc = ""
        try:
            owner_addr = self.fund_config[u256(0)]
        except Exception:
            pass
        try:
            mandate_desc = self.fund_config[u256(1)]
        except Exception:
            pass

        data = {
            "budget": str(self.fund_budget),
            "deployed": str(self.fund_deployed),
            "dry_powder": str(self.fund_budget - self.fund_reserved - self.fund_deployed),
            "mandate": mandate_desc,
            "max_ticket": str(self.max_ticket),
            "min_score": str(self.min_score),
            "owner": owner_addr,
            "portfolio_count": str(self.portfolio_count),
            "reserved": str(self.fund_reserved),
            "startup_count": str(self.startup_count),
        }
        return json.dumps(data, sort_keys=True, separators=(",", ":"))

    @gl.public.view
    def get_startup(self, startup_id: u256) -> str:
        if startup_id >= self.startup_count:
            return json.dumps({"error": "INVALID_STARTUP_ID"}, sort_keys=True, separators=(",", ":"))
        data = {
            "code_url": self.startup_code_url[startup_id],
            "docs_url": self.startup_docs_url[startup_id],
            "founder_url": self.startup_founder_url[startup_id],
            "market_url": self.startup_market_url[startup_id],
            "name": self.startup_name[startup_id],
            "product_url": self.startup_product_url[startup_id],
            "requested_ticket": str(self.startup_requested_ticket[startup_id]),
            "sector": self.startup_sector[startup_id],
            "status": self.startup_status[startup_id],
            "wallet": self.startup_wallet[startup_id],
        }
        return json.dumps(data, sort_keys=True, separators=(",", ":"))

    @gl.public.view
    def get_diligence(self, startup_id: u256) -> str:
        if startup_id >= self.startup_count:
            return json.dumps({"error": "INVALID_STARTUP_ID"}, sort_keys=True, separators=(",", ":"))
        data = {
            "decision": self.startup_decision[startup_id],
            "memo": self.startup_ai_memo[startup_id],
            "recommended_ticket": str(self.startup_recommended_ticket[startup_id]),
            "risk_score": str(self.startup_risk_score[startup_id]),
            "score": str(self.startup_score[startup_id]),
            "status": self.startup_status[startup_id],
            "valuation_cap_hint": str(self.startup_valuation_cap[startup_id]),
        }
        return json.dumps(data, sort_keys=True, separators=(",", ":"))

    @gl.public.view
    def get_portfolio_position(self, portfolio_id: u256) -> str:
        if portfolio_id >= self.portfolio_count:
            return json.dumps({"error": "INVALID_PORTFOLIO_ID"}, sort_keys=True, separators=(",", ":"))
        data = {
            "amount": str(self.portfolio_amount[portfolio_id]),
            "startup_id": str(self.portfolio_startup_id[portfolio_id]),
            "terms": self.portfolio_terms[portfolio_id],
        }
        return json.dumps(data, sort_keys=True, separators=(",", ":"))
