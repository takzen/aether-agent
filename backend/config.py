import os
from pathlib import Path

ENV_PATH = Path(__file__).parent / ".env"

def get_config() -> dict:
    """Read the current environment configuration."""
    print(f"[Config] CWD: {Path.cwd()}")
    print(f"[Config] Searching for .env at: {ENV_PATH.absolute()}")
    config = {
        "GEMINI_API_KEY": "",
        "TAVILY_API_KEY": "",
        "QDRANT_URL": "",
        "QDRANT_API_KEY": "",
        "MODEL_OVERRIDE": "gemini-3-flash"
    }
    
    if ENV_PATH.exists():
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    # Strip whitespace and potential surrounding quotes
                    val = val.strip()
                    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                        val = val[1:-1]
                    if key in config:
                        config[key] = val
                        
    return config

def write_config(new_config: dict) -> bool:
    """Write the new configuration to the .env file safely."""
    try:
        # Load current content to preserve unknown keys
        all_settings = {}
        if ENV_PATH.exists():
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip()
                        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                            v = v[1:-1]
                        all_settings[k] = v
        
        # Update with new values
        for k, v in new_config.items():
            all_settings[k] = v
            
        # Write back to file with quotes for safety
        print(f"[Config] Writing to {ENV_PATH.absolute()} — keys: {list(all_settings.keys())}")
        with open(ENV_PATH, "w", encoding="utf-8") as f:
            f.write("# Aether Agent Configuration\n")
            for k, v in all_settings.items():
                # We save with quotes to handle special characters, but we ensure we don't double-quote
                f.write(f'{k}="{v}"\n')
                    
        print("[Config] Write successful.")
        return True
    except Exception as e:
        print(f"[Config] Error writing config: {e}")
        return False
