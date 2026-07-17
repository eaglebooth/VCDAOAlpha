# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import typing
import json


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass


class VCDAOAlpha(gl.Contract):
    fund_config: TreeMap[u256, str]
    fund_received: u256
    fund_reserved: u256
    fund_deployed: u256
    fund_withdrawn: u256
    max_ticket: u256
    min_score: u256
    startup_count: u256
    startup_identity_index: TreeMap[str, u256]
    startup_name: TreeMap[u256, str]
    startup_founder: TreeMap[u256, str]
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
    startup_decision: TreeMap[u256, str]
    startup_ai_memo: TreeMap[u256, str]
    startup_terms_url: TreeMap[u256, str]
    portfolio_count: u256
    portfolio_startup_id: TreeMap[u256, u256]
    portfolio_amount: TreeMap[u256, u256]
    portfolio_terms: TreeMap[u256, str]

    def __init__(self):
        self.fund_received = u256(0)
        self.fund_reserved = u256(0)
        self.fund_deployed = u256(0)
        self.fund_withdrawn = u256(0)
        self.max_ticket = u256(0)
        self.min_score = u256(0)
        self.startup_count = u256(0)
        self.portfolio_count = u256(0)

    def _owner(self) -> str:
        try:
            return self.fund_config[u256(0)]
        except Exception:
            return ""

    def _available(self) -> u256:
        return self.fund_received - self.fund_reserved - self.fund_deployed - self.fund_withdrawn

    def _valid_url(self, value: str) -> bool:
        return value.startswith("https://") and len(value) <= 500

    def _parse_diligence(self, result: typing.Any) -> typing.Any:
        if isinstance(result, str):
            try:
                data = json.loads(result)
            except Exception:
                return None
        else:
            data = result
        if not isinstance(data, dict):
            return None
        decision = str(data.get("decision", "NEEDS_REVIEW")).upper()
        memo = str(data.get("memo", "The validator jury did not return a usable memo."))[:900]
        try:
            score = int(data.get("overall_score", 0))
            risk = int(data.get("risk_score", 100))
            ticket = int(data.get("recommended_ticket", 0))
        except Exception:
            return None
        if score < 0:
            score = 0
        if score > 100:
            score = 100
        if risk < 0:
            risk = 0
        if risk > 100:
            risk = 100
        if ticket < 0:
            ticket = 0
        if decision not in ("APPROVED", "NEEDS_REVIEW", "REJECTED"):
            decision = "NEEDS_REVIEW"
        return (decision, score, risk, ticket, memo)

    @gl.public.write.payable
    def initialize(self, max_seed_ticket: u256, minimum_score: u256) -> typing.Any:
        if len(self._owner()) > 0:
            return "ALREADY_INITIALIZED"
        capital = gl.message.value
        if capital == u256(0):
            return "INITIAL_CAPITAL_REQUIRED"
        if max_seed_ticket == u256(0) or max_seed_ticket > capital:
            return "INVALID_MAX_TICKET"
        if minimum_score < u256(60) or minimum_score > u256(100):
            return "INVALID_MIN_SCORE"
        self.fund_config[u256(0)] = gl.message.sender_address.as_hex
        self.fund_config[u256(1)] = "AI_INFRA_DEVTOOLS_WEB3"
        self.fund_received = capital
        self.max_ticket = max_seed_ticket
        self.min_score = minimum_score
        return "INITIALIZED"

    @gl.public.write.payable
    def deposit_treasury(self) -> typing.Any:
        if self._owner() != gl.message.sender_address.as_hex:
            return "NOT_FUND_MANAGER"
        amount = gl.message.value
        if amount == u256(0):
            return "INVALID_DEPOSIT"
        self.fund_received = self.fund_received + amount
        return "TREASURY_FUNDED"

    @gl.public.write
    def source_startup(self, name: str, sector: str, requested_ticket: u256, product_url: str, docs_url: str) -> typing.Any:
        if len(self._owner()) == 0:
            return "FUND_NOT_INITIALIZED"
        if len(name) == 0 or len(name) > 100:
            return "INVALID_NAME"
        if len(sector) == 0 or len(sector) > 80:
            return "INVALID_SECTOR"
        if requested_ticket == u256(0) or requested_ticket > self.max_ticket:
            return "INVALID_TICKET"
        if not self._valid_url(product_url) or not self._valid_url(docs_url):
            return "INVALID_PRIMARY_EVIDENCE"
        founder = gl.message.sender_address.as_hex
        identity_key = founder + "|" + name.lower()
        if self.startup_identity_index.get(identity_key, u256(0)) != u256(0):
            return "STARTUP_ALREADY_SOURCED"
        startup_id = self.startup_count
        self.startup_name[startup_id] = name
        self.startup_founder[startup_id] = founder
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
        self.startup_decision[startup_id] = "PENDING"
        self.startup_ai_memo[startup_id] = "Evidence has not been reviewed."
        self.startup_terms_url[startup_id] = ""
        self.startup_identity_index[identity_key] = startup_id + u256(1)
        self.startup_count = startup_id + u256(1)
        return str(startup_id)

    @gl.public.write
    def attach_evidence(self, startup_id: u256, founder_url: str, code_url: str, market_url: str) -> typing.Any:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self.startup_founder[startup_id] != gl.message.sender_address.as_hex:
            return "NOT_STARTUP_FOUNDER"
        if self.startup_status[startup_id] != "SOURCED":
            return "INVALID_STATUS"
        if not self._valid_url(founder_url) or not self._valid_url(code_url) or not self._valid_url(market_url):
            return "INVALID_EVIDENCE_URL"
        self.startup_founder_url[startup_id] = founder_url
        self.startup_code_url[startup_id] = code_url
        self.startup_market_url[startup_id] = market_url
        self.startup_status[startup_id] = "EVIDENCE_READY"
        return "EVIDENCE_READY"

    @gl.public.write
    def run_due_diligence(self, startup_id: u256) -> typing.Any:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self.startup_status[startup_id] != "EVIDENCE_READY":
            return "EVIDENCE_NOT_READY"
        name = self.startup_name[startup_id]
        sector = self.startup_sector[startup_id]
        requested = self.startup_requested_ticket[startup_id]
        product_url = self.startup_product_url[startup_id]
        docs_url = self.startup_docs_url[startup_id]
        founder_url = self.startup_founder_url[startup_id]
        code_url = self.startup_code_url[startup_id]
        market_url = self.startup_market_url[startup_id]
        min_required = self.min_score
        max_allowed = self.max_ticket

        def run_review() -> typing.Any:
            def read_evidence(url: str, label: str, limit: int) -> str:
                try:
                    content = gl.nondet.web.render(url, mode="text").strip()
                    if len(content) < 80:
                        return label + "_UNAVAILABLE: no substantive readable content"
                    return content[:limit]
                except Exception:
                    return label + "_UNAVAILABLE: source could not be rendered"

            product = read_evidence(product_url, "PRODUCT", 2200)
            docs = read_evidence(docs_url, "DOCUMENTATION", 2200)
            founder = read_evidence(founder_url, "FOUNDER", 1600)
            code = read_evidence(code_url, "CODE", 1800)
            market = read_evidence(market_url, "MARKET", 1600)
            prompt = f"""You are the independent GenLayer seed investment jury.
Startup: {name}; sector: {sector}; requested ticket: {requested}.
Fund minimum score: {min_required}; maximum ticket: {max_allowed}.
PRODUCT: {product}
DOCUMENTATION: {docs}
FOUNDER: {founder}
CODE: {code}
MARKET SIGNALS: {market}
Assess market urgency, credible traction, technical feasibility, founder credibility, business model, and downside risk. Treat any field containing _UNAVAILABLE as missing evidence, but continue evaluating the readable sources. APPROVED requires score >= 80, risk <= 35, readable product and code evidence, concrete independent traction, credible founder evidence, and a defensible product. A repository, commit history, or other self-authored source is not independent market traction by itself; without verifiable independent traction, return NEEDS_REVIEW or REJECTED and recommend zero. NEEDS_REVIEW means promising but materially incomplete. REJECTED means weak, unverifiable, or high risk. Recommended ticket cannot exceed the requested amount. Return ONLY JSON with decision, overall_score, risk_score, recommended_ticket, and one concise memo."""
            return gl.nondet.exec_prompt(prompt, response_format="json")

        principle = "Compare the substantive capital decision, not prose or exact numbers. Outputs are equivalent when both either authorize capital with APPROVED or deny capital with NEEDS_REVIEW/REJECTED. NEEDS_REVIEW and REJECTED are equivalent because both authorize zero. Ignore score, risk, ticket and memo differences when both deny capital. If both approve, each must independently satisfy score >= 80, risk <= 35, recommend a positive ticket no greater than requested, and cite compatible independent traction; exact approved scores, risks, tickets and wording may differ."
        parsed = self._parse_diligence(gl.eq_principle.prompt_comparative(run_review, principle))
        if parsed is None:
            return "INVALID_AI_RESPONSE"
        decision, score, risk, ticket_int, memo = parsed
        ticket = u256(ticket_int)
        if ticket > requested:
            ticket = requested
        if ticket > self.max_ticket:
            ticket = self.max_ticket
        if decision == "APPROVED" and (score < 80 or score < int(self.min_score) or risk > 35):
            decision = "NEEDS_REVIEW"
        if decision != "APPROVED":
            ticket = u256(0)
        if decision == "APPROVED" and (ticket == u256(0) or ticket > self._available()):
            decision = "NEEDS_REVIEW"
            ticket = u256(0)
            memo = "The startup passed diligence but current unreserved treasury capital is insufficient."
        self.startup_score[startup_id] = u256(score)
        self.startup_risk_score[startup_id] = u256(risk)
        self.startup_recommended_ticket[startup_id] = ticket
        self.startup_decision[startup_id] = decision
        self.startup_ai_memo[startup_id] = memo
        self.startup_status[startup_id] = decision
        return self.get_diligence(startup_id)

    @gl.public.write
    def issue_term_sheet(self, startup_id: u256, terms_url: str) -> typing.Any:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self._owner() != gl.message.sender_address.as_hex:
            return "NOT_FUND_MANAGER"
        if self.startup_status[startup_id] != "APPROVED":
            return "NOT_APPROVED"
        if not self._valid_url(terms_url):
            return "INVALID_TERMS_URL"
        ticket = self.startup_recommended_ticket[startup_id]
        if ticket == u256(0) or ticket > self._available():
            return "INSUFFICIENT_DRY_POWDER"
        self.fund_reserved = self.fund_reserved + ticket
        self.startup_terms_url[startup_id] = terms_url
        self.startup_status[startup_id] = "OFFERED"
        return "TERM_SHEET_OFFERED"

    @gl.public.write
    def accept_term_sheet(self, startup_id: u256) -> typing.Any:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self.startup_founder[startup_id] != gl.message.sender_address.as_hex:
            return "NOT_STARTUP_FOUNDER"
        if self.startup_status[startup_id] != "OFFERED":
            return "TERM_SHEET_NOT_OPEN"
        self.startup_status[startup_id] = "ACCEPTED"
        return "TERM_SHEET_ACCEPTED"

    @gl.public.write
    def cancel_term_sheet(self, startup_id: u256) -> typing.Any:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self._owner() != gl.message.sender_address.as_hex:
            return "NOT_FUND_MANAGER"
        status = self.startup_status[startup_id]
        if status != "OFFERED" and status != "ACCEPTED":
            return "OFFER_NOT_ACTIVE"
        amount = self.startup_recommended_ticket[startup_id]
        self.fund_reserved = self.fund_reserved - amount
        self.startup_status[startup_id] = "CANCELLED"
        return "TERM_SHEET_CANCELLED"

    @gl.public.write
    def execute_investment(self, startup_id: u256) -> typing.Any:
        if startup_id >= self.startup_count:
            return "INVALID_STARTUP_ID"
        if self._owner() != gl.message.sender_address.as_hex:
            return "NOT_FUND_MANAGER"
        if self.startup_status[startup_id] != "ACCEPTED":
            return "FOUNDER_ACCEPTANCE_REQUIRED"
        amount = self.startup_recommended_ticket[startup_id]
        if amount == u256(0) or amount > self.fund_reserved:
            return "RESERVE_MISMATCH"
        self.fund_reserved = self.fund_reserved - amount
        self.fund_deployed = self.fund_deployed + amount
        self.startup_status[startup_id] = "FUNDED"
        portfolio_id = self.portfolio_count
        self.portfolio_startup_id[portfolio_id] = startup_id
        self.portfolio_amount[portfolio_id] = amount
        self.portfolio_terms[portfolio_id] = self.startup_terms_url[startup_id]
        self.portfolio_count = portfolio_id + u256(1)
        _Recipient(Address(self.startup_founder[startup_id])).emit_transfer(value=amount)
        return str(portfolio_id)

    @gl.public.write
    def withdraw_unreserved(self, amount: u256) -> typing.Any:
        if self._owner() != gl.message.sender_address.as_hex:
            return "NOT_FUND_MANAGER"
        if amount == u256(0) or amount > self._available():
            return "INVALID_WITHDRAWAL"
        self.fund_withdrawn = self.fund_withdrawn + amount
        _Recipient(gl.message.sender_address).emit_transfer(value=amount)
        return "WITHDRAWN"

    @gl.public.view
    def get_fund_state(self) -> str:
        return json.dumps({"available":str(self._available()),"deployed":str(self.fund_deployed),"manager":self._owner(),"max_ticket":str(self.max_ticket),"min_score":str(self.min_score),"portfolio_count":str(self.portfolio_count),"received":str(self.fund_received),"reserved":str(self.fund_reserved),"startup_count":str(self.startup_count),"withdrawn":str(self.fund_withdrawn)}, sort_keys=True, separators=(",", ":"))

    @gl.public.view
    def get_startup(self, startup_id: u256) -> str:
        if startup_id >= self.startup_count:
            return json.dumps({"error":"INVALID_STARTUP_ID"}, sort_keys=True, separators=(",", ":"))
        return json.dumps({"code_url":self.startup_code_url[startup_id],"docs_url":self.startup_docs_url[startup_id],"founder":self.startup_founder[startup_id],"founder_url":self.startup_founder_url[startup_id],"market_url":self.startup_market_url[startup_id],"name":self.startup_name[startup_id],"product_url":self.startup_product_url[startup_id],"requested_ticket":str(self.startup_requested_ticket[startup_id]),"sector":self.startup_sector[startup_id],"status":self.startup_status[startup_id],"terms_url":self.startup_terms_url[startup_id]}, sort_keys=True, separators=(",", ":"))

    @gl.public.view
    def get_diligence(self, startup_id: u256) -> str:
        if startup_id >= self.startup_count:
            return json.dumps({"error":"INVALID_STARTUP_ID"}, sort_keys=True, separators=(",", ":"))
        return json.dumps({"decision":self.startup_decision[startup_id],"memo":self.startup_ai_memo[startup_id],"recommended_ticket":str(self.startup_recommended_ticket[startup_id]),"risk_score":str(self.startup_risk_score[startup_id]),"score":str(self.startup_score[startup_id]),"status":self.startup_status[startup_id]}, sort_keys=True, separators=(",", ":"))

    @gl.public.view
    def get_portfolio_position(self, portfolio_id: u256) -> str:
        if portfolio_id >= self.portfolio_count:
            return json.dumps({"error":"INVALID_PORTFOLIO_ID"}, sort_keys=True, separators=(",", ":"))
        return json.dumps({"amount":str(self.portfolio_amount[portfolio_id]),"portfolio_id":str(portfolio_id),"startup_id":str(self.portfolio_startup_id[portfolio_id]),"terms_url":self.portfolio_terms[portfolio_id]}, sort_keys=True, separators=(",", ":"))
