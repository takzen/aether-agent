from config import get_config, write_config
import os

print("Initial config:", get_config())
success = write_config({"MODEL_OVERRIDE": "ollama:llama3.2"})
print("Write success:", success)
print("Config after write:", get_config())

if os.path.exists(".env"):
    with open(".env", "r") as f:
        print("File content raw:")
        print(f.read())
