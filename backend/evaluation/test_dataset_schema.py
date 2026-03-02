from __future__ import annotations

import pytest

from evaluation.dataset import load_dataset_cases


def test_dataset_cases_have_valid_schema():
    cases = load_dataset_cases()
    assert cases, "No dataset cases found in evaluation datasets."

    seen_ids: set[str] = set()
    required_threshold_keys = {"faithfulness", "answer_relevancy", "hhem_consistency"}

    for idx, case in enumerate(cases):
        assert isinstance(case, dict), f"Case #{idx} is not an object."

        case_id = case.get("id")
        assert isinstance(case_id, str) and case_id.strip(), f"Case #{idx} has missing/invalid 'id'."
        assert case_id not in seen_ids, f"Duplicate case id: {case_id}"
        seen_ids.add(case_id)

        question = case.get("question")
        assert isinstance(question, str) and question.strip(), f"{case_id}: missing/invalid 'question'."

        expected_answer = case.get("expected_answer")
        assert isinstance(expected_answer, str), f"{case_id}: 'expected_answer' must be a string."

        gold_contexts = case.get("gold_contexts")
        assert isinstance(gold_contexts, list), f"{case_id}: 'gold_contexts' must be a list."
        for cidx, ctx in enumerate(gold_contexts):
            assert isinstance(ctx, str) and ctx.strip(), f"{case_id}: gold_contexts[{cidx}] must be a non-empty string."

        source_docs = case.get("source_docs")
        assert isinstance(source_docs, list), f"{case_id}: 'source_docs' must be a list."
        for didx, doc in enumerate(source_docs):
            assert isinstance(doc, dict), f"{case_id}: source_docs[{didx}] must be an object."
            if "doc_id" in doc:
                assert isinstance(doc["doc_id"], str) and doc["doc_id"].strip(), (
                    f"{case_id}: source_docs[{didx}].doc_id must be non-empty string."
                )
            if "chunk_ids" in doc:
                assert isinstance(doc["chunk_ids"], list), f"{case_id}: source_docs[{didx}].chunk_ids must be a list."

        thresholds = case.get("generation_thresholds")
        assert isinstance(thresholds, dict), f"{case_id}: missing/invalid 'generation_thresholds'."
        missing = required_threshold_keys - set(thresholds.keys())
        assert not missing, f"{case_id}: missing threshold keys: {sorted(missing)}"

        for key in required_threshold_keys:
            value = thresholds[key]
            assert isinstance(value, (int, float)), f"{case_id}: threshold '{key}' must be numeric."
            assert 0.0 <= float(value) <= 1.0, f"{case_id}: threshold '{key}' must be between 0.0 and 1.0."

