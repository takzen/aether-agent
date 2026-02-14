import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

# Nowy SDK (google-genai)
client = genai.Client(api_key=api_key)

print(f"Checking models for API Key ending in: ...{api_key[-4:] if api_key else 'None'}")
try:
    print("Listing ALL models:")
    for m in client.models.list():
        print(f"- {m.name}")
except Exception as e:
    print(f"Error list_models: {e}")
