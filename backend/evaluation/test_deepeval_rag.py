import pytest


pytestmark = [pytest.mark.audit, pytest.mark.integration]


@pytest.mark.slow
def test_rag_faithfulness_and_relevancy(gemini_judge, audit_record):
    metrics_module = pytest.importorskip("deepeval.metrics")
    test_case_module = pytest.importorskip("deepeval.test_case")

    FaithfulnessMetric = metrics_module.FaithfulnessMetric
    AnswerRelevancyMetric = metrics_module.AnswerRelevancyMetric
    LLMTestCase = test_case_module.LLMTestCase

    context = [
        "Adamatzky (2022) identified 50 electrical spike patterns in fungi.",
        "Schizophyllum commune shows the richest sentence-like signaling and the most complex syntax among tested species.",
        "Other species included Cordyceps militaris, Flammulina velutipes, and Omphalotus nidiformis.",
    ]
    input_text = "Which fungus has the most complex language and how large is its vocabulary?"
    actual_output = (
        "According to Adamatzky's research, Schizophyllum commune has the most complex syntax. "
        "The fungal vocabulary contains up to 50 words."
    )

    test_case = LLMTestCase(
        input=input_text,
        actual_output=actual_output,
        retrieval_context=context,
    )

    faithfulness_metric = FaithfulnessMetric(threshold=0.7, model=gemini_judge)
    relevancy_metric = AnswerRelevancyMetric(threshold=0.7, model=gemini_judge)
    faithfulness_metric.measure(test_case)
    relevancy_metric.measure(test_case)

    faithfulness_score = float(faithfulness_metric.score)
    relevancy_score = float(relevancy_metric.score)
    audit_record(
        "faithfulness",
        faithfulness_score,
        faithfulness_metric.threshold,
        getattr(faithfulness_metric, "reason", ""),
    )
    audit_record(
        "answer_relevancy",
        relevancy_score,
        relevancy_metric.threshold,
        getattr(relevancy_metric, "reason", ""),
    )
    assert faithfulness_score >= faithfulness_metric.threshold
    assert relevancy_score >= relevancy_metric.threshold
