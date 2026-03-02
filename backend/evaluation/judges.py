import os
from functools import lru_cache
from typing import Optional

DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite"
VECTARA_HHEM_MODEL = "vectara/hallucination_evaluation_model"


def build_gemini_judge(model_name: str = DEFAULT_GEMINI_MODEL, api_key: Optional[str] = None):
    from deepeval.models.base_model import DeepEvalBaseLLM
    from google import genai

    class GeminiJudge(DeepEvalBaseLLM):
        def __init__(self, model_name: str = DEFAULT_GEMINI_MODEL, api_key: Optional[str] = None):
            self.model_name = os.getenv("DEEPEVAL_GEMINI_MODEL", model_name)
            key = api_key or os.getenv("GOOGLE_API_KEY")
            self.client = genai.Client(api_key=key) if key else None

        def load_model(self):
            if self.client is None:
                raise RuntimeError("GOOGLE_API_KEY is not configured.")
            return self.client

        def generate(self, prompt: str) -> str:
            client = self.load_model()
            response = client.models.generate_content(model=self.model_name, contents=prompt)
            return response.text or ""

        async def a_generate(self, prompt: str) -> str:
            return self.generate(prompt)

        def get_model_name(self):
            return self.model_name

    return GeminiJudge(model_name=model_name, api_key=api_key)


class VectaraHHEMJudge:
    def __init__(self, model_name: str = VECTARA_HHEM_MODEL):
        from transformers import AutoModelForSequenceClassification

        self.model_name = model_name
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name, trust_remote_code=True)
        self.model.eval()

    def consistency(self, context: str, output: str) -> float:
        import torch

        if hasattr(self.model, "predict"):
            score = self.model.predict([(context, output)])[0]
            return float(score.item() if hasattr(score, "item") else score)

        tokenizer = getattr(self.model, "tokenzier", None) or getattr(self.model, "tokenizer", None)
        if tokenizer is None:
            raise RuntimeError("Vectara model does not expose tokenizer or predict().")

        prompt = getattr(self.model, "prompt", "{text1}\n{text2}")
        payload = prompt.format(text1=context, text2=output)
        inputs = tokenizer([payload], return_tensors="pt", padding=True, truncation=True, max_length=512)
        with torch.no_grad():
            outputs = self.model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1)
        return float(probs[0][1].item())


@lru_cache(maxsize=1)
def get_vectara_hhem_judge() -> VectaraHHEMJudge:
    # Cache one model instance to avoid repeated heavy downloads/loads per test run.
    return VectaraHHEMJudge()
