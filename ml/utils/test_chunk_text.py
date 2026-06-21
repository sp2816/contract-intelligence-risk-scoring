from ml.utils.chunk_text import (
    chunk_text
)

text = (
    "hello world " * 1000
)

chunks = chunk_text(
    text
)

print(
    "Chunks:",
    len(chunks)
)

print(
    "First Chunk Length:",
    len(chunks[0].split())
)