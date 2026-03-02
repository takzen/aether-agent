# Evaluation Test Guide

This document describes how to run and interpret backend evaluation tests in the `backend/evaluation` directory.

The scope of this document is limited to `backend/evaluation` (LLM response quality audit).
Application tests (backend unit/integration) remain in `backend/tests`.

## Purpose

Evaluation tests check response quality (RAG style) using two independent judges:

1. `DeepEval + Gemini` to assess `faithfulness` and `relevancy` of responses.
2. `Vectara HHEM` to assess consistency and hallucination risk.

These are **audit/integration** tests, not unit tests. They may require network access, API keys, and model downloads.

## File Map

- `backend/evaluation/test_deepeval_rag.py`
  - `FaithfulnessMetric` and `AnswerRelevancyMetric` metrics
  - judge: Gemini via `google-genai`
- `backend/evaluation/test_vectara_hhem.py`
  - Vectara HHEM consistency metric
  - model: `vectara/hallucination_evaluation_model`
- `backend/evaluation/test_dataset_schema.py`
  - dataset schema validation (id, required fields, types, 0..1 thresholds)
- `backend/evaluation/dataset.py`
  - case loader from `.json` and `.jsonl` files
  - filter for "ready" cases (without `TODO`, with non-empty `gold_contexts`)
- `backend/evaluation/judges.py`
  - helper judge classes/factories
  - cache for Vectara model instance during run
- `backend/evaluation/conftest.py`
  - CLI options (`--run-audit`, `--audit-report-json`)
  - markers and default `skip`
  - JSON report generation
- `backend/evaluation/example_rag_case.json` and `backend/evaluation/biology_mykology_backlog_30.jsonl`
  - RAG case dataset for audit
  - records with `expected_answer = "TODO"` or empty `gold_contexts` are skipped
- `backend/evaluation/behavioral_scenarios_25.jsonl`
  - backlog of scenarios for behavioral evaluation (manual or for automation)
- `backend/evaluation/behavioral_review_template_25.jsonl`
  - review results template for scenarios (`status`, `result`, `notes`, `evidence`)
- `backend/evaluation/run_audit.bat`
  - single-command audit execution on Windows

## Markers and Run Model

Tests have markers:

- `audit`
- `integration`
- `slow`

Default behavior:

- `pytest -q evaluation` -> tests are detected, but `skipped`
- to actually run them, `--run-audit` must be provided

## Requirements

Install backend dependencies from `backend/pyproject.toml`.

In practice, the following are needed:

- `pytest`
- `deepeval` (DeepEval test)
- `google-genai` (DeepEval/Gemini test)
- `torch` and `transformers` (Vectara test)

## Environment Variables

- `GOOGLE_API_KEY` is required for the DeepEval/Gemini test
- optionally `DEEPEVAL_GEMINI_MODEL` to override the model (default `gemini-2.5-flash-lite`)
- if the key is missing, the DeepEval test will be correctly marked as `skipped`

Example (PowerShell):

```powershell
$env:GOOGLE_API_KEY = "your_api_key"
$env:DEEPEVAL_GEMINI_MODEL = "gemini-2.5-flash-lite"
```

## Run Commands

Run from the repo directory:

```powershell
cd backend
```

Quick check (without running the audit):

```powershell
pytest -q evaluation
```

Dataset validation (without API and external models):

```powershell
pytest -q evaluation/test_dataset_schema.py
```

Full audit:

```powershell
pytest -q evaluation --run-audit
```

Full audit + save JSON report:

```powershell
pytest -q evaluation --run-audit --audit-report-json evaluation/audit-report.json
```

Vectara only:

```powershell
pytest -q evaluation/test_vectara_hhem.py --run-audit --audit-report-json evaluation/audit-report.json
```

DeepEval only:

```powershell
pytest -q evaluation/test_deepeval_rag.py --run-audit --audit-report-json evaluation/audit-report.json
```

One command on Windows:

```powershell
.\evaluation\run_audit.bat
```

Custom report path:

```powershell
.\evaluation\run_audit.bat evaluation\audit-report.json
```

## How the JSON Report Works

The `--audit-report-json <path>` option saves a report containing:

- run metadata (`generated_at_utc`, `exitstatus`, `run_audit`)
- summary (`total`, `passed`, `failed`, `skipped`)
- test cases (`nodeid`, `outcome`, optionally `reason`)
- case metadata (`metadata`), e.g., `deepeval_model`
- metrics (`name`, `score`, `threshold`, `passed`, `reason`) if the test provides them

Example file:

- `backend/evaluation/audit-report.json`

## Pass/Fail Logic

`test_deepeval_rag.py`:

- metrics:
  - `faithfulness`
  - `answer_relevancy`
- thresholds are read per-case from `generation_thresholds`
- fallback: `0.7` if key is missing in the record
- the test fails if any result drops below the threshold

`test_vectara_hhem.py`:

- metric: `consistency_score`
- threshold is read per-case from `generation_thresholds.hhem_consistency`
- fallback: `0.8` if key is missing in the record
- the test fails if the result drops below the threshold

Note:

- dataset cases with `expected_answer = "TODO"` or empty `gold_contexts` are skipped by audit tests

## Interpreting Results

`skipped`:

- no `--run-audit`, or
- missing dependencies (e.g., `deepeval`), or
- missing `GOOGLE_API_KEY` for DeepEval

`failed`:

- metric score below threshold, or
- runtime/service/model error

`passed`:

- all assertions and thresholds met

## Troubleshooting

`ModuleNotFoundError`:

- install missing packages in the backend environment

DeepEval is `skipped` despite `--run-audit`:

- check `GOOGLE_API_KEY`
- check `deepeval` and `google-genai` installation

First Vectara run is slow:

- this is normal (model download and loading)

Pytest warnings about `asyncio_*`:

- this signals a plugin/environment version mismatch
- usually doesn't block evaluation tests, but it's worth aligning `pytest` and `pytest-asyncio` versions

Warning about `.pytest_cache`:

- doesn't block the audit
- usually a filesystem permissions issue