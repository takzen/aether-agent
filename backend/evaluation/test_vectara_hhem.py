import pytest

from evaluation.dataset import filter_ready_cases, load_dataset_cases

pytestmark = [pytest.mark.audit, pytest.mark.integration, pytest.mark.slow]


def test_vectara_hhem_consistency(vectara_hhem_judge):
    ready_cases = filter_ready_cases(load_dataset_cases())
    if not ready_cases:
        pytest.skip("No ready RAG dataset cases found. Fill expected_answer and gold_contexts first.")

    for case in ready_cases:
        thresholds = case.get("generation_thresholds", {})
        hhem_threshold = float(thresholds.get("hhem_consistency", 0.8))
        context = "\n".join(str(c) for c in case["gold_contexts"])
        output = case["expected_answer"]

        consistency_score = vectara_hhem_judge.consistency(context, output)
        case_id = str(case.get("id", "unknown"))
        assert consistency_score >= hhem_threshold, (
            f"{case_id}: expected HHEM >= {hhem_threshold:.3f}, got {consistency_score:.3f}"
        )
