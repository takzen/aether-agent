# Evaluation Tests

This folder contains external audit tests for RAG quality.
Application tests (including backend integration tests) stay in `backend/tests`.

## Test types
- `test_deepeval_rag.py`: DeepEval metrics (`Faithfulness`, `AnswerRelevancy`) using Gemini as judge.
- `test_vectara_hhem.py`: Vectara HHEM hallucination consistency scoring.
- Both tests are dataset-driven: they load cases from `example_rag_case.json` and `biology_mykology_backlog_30.jsonl`.
- Cases with missing `gold_contexts` or `expected_answer = "TODO"` are skipped automatically.

## Safety defaults
- All tests here are marked `audit`.
- Audit tests are skipped by default.
- Enable them explicitly with `--run-audit`.

## Run commands
- One-command run (Windows):
  - `evaluation\run_audit.bat`
- One-command run with custom report path:
  - `evaluation\run_audit.bat evaluation\audit-report.json`
- Collect/verify structure:
  - `pytest -q evaluation`
- Run all audit tests:
  - `pytest -q evaluation --run-audit`
- Run all audit tests and save JSON report:
  - `pytest -q evaluation --run-audit --audit-report-json evaluation/audit-report.json`
- Run only Vectara audit:
  - `pytest -q evaluation/test_vectara_hhem.py --run-audit`
- Run only DeepEval audit:
  - `pytest -q evaluation/test_deepeval_rag.py --run-audit`

## Required environment
- For DeepEval/Gemini:
  - `GOOGLE_API_KEY`
- For Vectara HHEM:
  - Internet access on first run to download the Hugging Face model.
