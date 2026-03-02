import pytest


pytestmark = [pytest.mark.audit, pytest.mark.integration, pytest.mark.slow]


def test_vectara_hhem_consistency(vectara_hhem_judge):
    context = (
        "Adamatzky (2022) identified 50 electrical spike patterns in fungi. "
        "Schizophyllum commune has the most complex syntax among studied species."
    )
    output = (
        "Schizophyllum commune is the species with the most complex syntax, "
        "and the fungal signaling lexicon contains up to 50 words."
    )

    consistency_score = vectara_hhem_judge.consistency(context, output)
    assert consistency_score >= 0.8, f"Expected HHEM consistency >= 0.8, got {consistency_score:.3f}"
