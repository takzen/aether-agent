import json
from pathlib import Path


EVALUATION_DIR = Path(__file__).parent
DEFAULT_DATASET_FILES = [
    EVALUATION_DIR / "example_rag_case.json",
    EVALUATION_DIR / "biology_mykology_backlog_30.jsonl",
]


def _read_json_file(path: Path) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        return [payload]
    return []


def _read_jsonl_file(path: Path) -> list[dict]:
    rows: list[dict] = []
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        item = json.loads(line)
        if isinstance(item, dict):
            rows.append(item)
    return rows


def load_dataset_cases(files: list[Path] | None = None) -> list[dict]:
    cases: list[dict] = []
    for path in files or DEFAULT_DATASET_FILES:
        if not path.exists():
            continue
        if path.suffix.lower() == ".jsonl":
            cases.extend(_read_jsonl_file(path))
            continue
        if path.suffix.lower() == ".json":
            cases.extend(_read_json_file(path))
    return cases


def filter_ready_cases(cases: list[dict]) -> list[dict]:
    ready: list[dict] = []
    for case in cases:
        expected_answer = str(case.get("expected_answer", "")).strip()
        gold_contexts = case.get("gold_contexts")
        question = str(case.get("question", "")).strip()
        if not question:
            continue
        if not expected_answer or expected_answer.upper() == "TODO":
            continue
        if not isinstance(gold_contexts, list) or not gold_contexts:
            continue
        ready.append(case)
    return ready
