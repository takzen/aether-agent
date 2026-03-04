import os
import re

search_dir = 'frontend/src'

# Match entire double-quoted string: "http://localhost:8000/something"
pattern_double_quotes = re.compile(r'"http://localhost:8000([^"]*)"')

# Match entire backtick string: `http://localhost:8000/something`
pattern_backticks = re.compile(r'`http://localhost:8000([^`]*)`')

for root, _, files in os.walk(search_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace double quoted
            new_content = pattern_double_quotes.sub(r'`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}\1`', content)
            
            # Replace single backticked 
            new_content = pattern_backticks.sub(r'`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}\1`', new_content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
