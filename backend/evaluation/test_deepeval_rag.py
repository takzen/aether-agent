import pytest

from evaluation.dataset import filter_ready_cases, load_dataset_cases

pytestmark = [pytest.mark.audit, pytest.mark.integration]


@pytest.mark.slow
def test_rag_faithfulness_and_relevancy(gemini_judge, audit_record, audit_meta):
    metrics_module = pytest.importorskip("deepeval.metrics")
    test_case_module = pytest.importorskip("deepeval.test_case")

    FaithfulnessMetric = metrics_module.FaithfulnessMetric
    AnswerRelevancyMetric = metrics_module.AnswerRelevancyMetric
    LLMTestCase = test_case_module.LLMTestCase

    ready_cases = filter_ready_cases(load_dataset_cases())
    if not ready_cases:
        pytest.skip("No ready RAG dataset cases found. Fill expected_answer and gold_contexts first.")
    audit_meta(deepeval_model=gemini_judge.get_model_name())

    for case in ready_cases:
        thresholds = case.get("generation_thresholds", {})
        faithfulness_threshold = float(thresholds.get("faithfulness", 0.7))
        relevancy_threshold = float(thresholds.get("answer_relevancy", 0.7))

        test_case = LLMTestCase(
            input=case["question"],
            actual_output=case["expected_answer"],
            retrieval_context=case["gold_contexts"],
        )

        faithfulness_metric = FaithfulnessMetric(threshold=faithfulness_threshold, model=gemini_judge)
        relevancy_metric = AnswerRelevancyMetric(threshold=relevancy_threshold, model=gemini_judge)
        faithfulness_metric.measure(test_case)
        relevancy_metric.measure(test_case)

        faithfulness_score = float(faithfulness_metric.score)
        relevancy_score = float(relevancy_metric.score)
        case_id = str(case.get("id", "unknown"))
        audit_record(
            f"{case_id}:faithfulness",
            faithfulness_score,
            faithfulness_metric.threshold,
            getattr(faithfulness_metric, "reason", ""),
        )
        audit_record(
            f"{case_id}:answer_relevancy",
            relevancy_score,
            relevancy_metric.threshold,
            getattr(relevancy_metric, "reason", ""),
        )
        assert faithfulness_score >= faithfulness_metric.threshold, (
            f"{case_id}: faithfulness {faithfulness_score:.3f} < {faithfulness_metric.threshold:.3f}"
        )
        assert relevancy_score >= relevancy_metric.threshold, (
            f"{case_id}: answer_relevancy {relevancy_score:.3f} < {relevancy_metric.threshold:.3f}"
        )
