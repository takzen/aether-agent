import os
import json
from datetime import datetime, timezone
from pathlib import Path

import pytest
from dotenv import load_dotenv

from evaluation.judges import build_gemini_judge, get_vectara_hhem_judge


load_dotenv()


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--run-audit",
        action="store_true",
        default=False,
        help="Run external LLM audit tests (network, model downloads, paid APIs).",
    )
    parser.addoption(
        "--audit-report-json",
        action="store",
        default="",
        help="Write audit test report to JSON file. Defaults to evaluation/audit-report.json when --run-audit is used.",
    )


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line("markers", "audit: external audit tests (disabled unless --run-audit).")
    config.addinivalue_line("markers", "slow: heavyweight tests.")
    config.addinivalue_line("markers", "integration: tests requiring external services/models.")
    config._audit_case_results = {}


def pytest_collection_modifyitems(config: pytest.Config, items: list[pytest.Item]) -> None:
    if config.getoption("--run-audit"):
        return
    skip_audit = pytest.mark.skip(reason="Audit tests are disabled. Use --run-audit to enable.")
    for item in items:
        if "audit" in item.keywords:
            item.add_marker(skip_audit)


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item: pytest.Item, call: pytest.CallInfo):
    outcome = yield
    report = outcome.get_result()
    if "audit" not in item.keywords:
        return

    cases = item.config._audit_case_results
    case = cases.setdefault(
        item.nodeid,
        {
            "nodeid": item.nodeid,
            "outcome": "unknown",
            "metrics": [],
        },
    )

    if report.when == "setup" and report.outcome == "skipped":
        case["outcome"] = "skipped"
        case["reason"] = str(report.longrepr)
        return

    if report.when != "call":
        return

    case["outcome"] = report.outcome
    metric_payloads = [value for key, value in report.user_properties if key == "audit_metric"]
    if metric_payloads:
        case["metrics"] = metric_payloads


def pytest_sessionfinish(session: pytest.Session, exitstatus: int) -> None:
    config = session.config
    report_path = config.getoption("--audit-report-json")
    if not report_path and config.getoption("--run-audit"):
        report_path = "evaluation/audit-report.json"
    if not report_path:
        return

    cases = list(config._audit_case_results.values())
    payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "run_audit": bool(config.getoption("--run-audit")),
        "exitstatus": int(exitstatus),
        "summary": {
            "total": len(cases),
            "passed": sum(1 for c in cases if c["outcome"] == "passed"),
            "failed": sum(1 for c in cases if c["outcome"] == "failed"),
            "skipped": sum(1 for c in cases if c["outcome"] == "skipped"),
        },
        "cases": cases,
    }

    output_path = Path(report_path)
    if not output_path.is_absolute():
        output_path = Path(config.rootpath) / output_path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=True, indent=2), encoding="utf-8")


@pytest.fixture
def audit_record(request: pytest.FixtureRequest):
    def _record(name: str, score: float, threshold: float, reason: str = "") -> None:
        request.node.user_properties.append(
            (
                "audit_metric",
                {
                    "name": name,
                    "score": float(score),
                    "threshold": float(threshold),
                    "passed": bool(score >= threshold),
                    "reason": reason,
                },
            )
        )

    return _record


@pytest.fixture(scope="session")
def gemini_judge():
    pytest.importorskip("deepeval")
    pytest.importorskip("google.genai")
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        pytest.skip("GOOGLE_API_KEY is not set.")
    return build_gemini_judge(api_key=api_key)


@pytest.fixture(scope="session")
def vectara_hhem_judge():
    pytest.importorskip("torch")
    pytest.importorskip("transformers")
    return get_vectara_hhem_judge()
