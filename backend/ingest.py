
import os
import asyncio
import glob
from pathlib import Path
from memory import memory_manager
from database import DatabaseService

# Configuration
SOURCE_DIR = "./knowledge_source"
CHUNK_SIZE = 1000  # Characters for now, rough approximation
CHUNK_OVERLAP = 200

TEXT_EXTENSIONS = {".txt", ".md", ".markdown", ".log", ".json", ".yaml", ".yml", ".csv"}

def split_text(text: str, chunk_size=1000, overlap=100) -> list[str]:
    """
    Very simple text splitter.
    In production, use LangChain's RecursiveCharacterTextSplitter.
    """
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
        
    return chunks

async def process_content(content: str, filename: str, db: DatabaseService, file_size: str = "Unknown"):
    """
    Chunks content, embeds it, and saves to DB.
    """
    try:
        chunks = split_text(content, CHUNK_SIZE, CHUNK_OVERLAP)
        
        print(f" -> Found {len(chunks)} chunks for {filename}.")
        
        for i, chunk in enumerate(chunks):
            # Generate embedding
            embedding = await memory_manager.get_embedding(chunk)
            if not embedding:
                print(f" -> Failed to embed chunk {i}. Skipping.")
                continue
                
            # Save to DB (Documents Collection)
            metadata = {
                "source": filename,
                "size": file_size,
                "chunk_index": i,
                "total_chunks": len(chunks)
            }
            
            db.add_document_chunk(
                content=chunk,
                embedding=embedding,
                metadata=metadata
            )
            # Rate limit politeness
            await asyncio.sleep(0.5) 
            
        print(f" -> Finished processing {filename}")
        return True
        
    except Exception as e:
        print(f"Error processing content for {filename}: {e}")
        return False

def extract_text_from_file(file_path: str) -> str:
    """
    Extract raw text from supported file types.
    Supports:
    - Plain text-like files (.txt, .md, .json, ...)
    - PDF via pypdf
    """
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        try:
            from pypdf import PdfReader
        except Exception as e:
            raise ValueError(
                "PDF parsing requires 'pypdf'. Install dependencies (e.g. `uv sync` in backend or `pip install pypdf`)."
            ) from e
        reader = PdfReader(str(path))
        pages = []
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        text = "\n\n".join(pages).strip()
        if not text:
            raise ValueError("PDF extraction produced empty text (possibly scanned image PDF).")
        return text

    if suffix in TEXT_EXTENSIONS:
        return path.read_text(encoding="utf-8", errors="ignore")

    raise ValueError(f"Unsupported file type for indexing: '{suffix}'")

async def process_file(file_path: str, db: DatabaseService):
    """
    Reads a file and delegates to process_content.
    """
    print(f"Processing: {file_path}")
    try:
        content = extract_text_from_file(file_path)
            
        filename = os.path.basename(file_path)
        stats = os.stat(file_path)
        file_size = f"{round(stats.st_size / 1024, 1)} KB"
        
        await process_content(content, filename, db, file_size)
        
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")

async def main():
    db = DatabaseService()
    
    # 1. Find all markdown and text files
    files = glob.glob(os.path.join(SOURCE_DIR, "**/*.md"), recursive=True) + \
            glob.glob(os.path.join(SOURCE_DIR, "**/*.txt"), recursive=True)
            
    if not files:
        print(f"No .md or .txt files found in {SOURCE_DIR}")
        print("Please add some files to ingest.")
        return

    print(f"Found {len(files)} files to ingest...")
    
    # 2. Process each file
    for file in files:
        await process_file(file, db)
        
    print("\nIngestion complete!")

if __name__ == "__main__":
    asyncio.run(main())
