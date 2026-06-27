import faiss
import numpy as np

embeddings = np.load(
    "ml/embeddings/sample_embeddings.npy"
)

dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(
    dimension
)

index.add(
    embeddings.astype("float32")
)

faiss.write_index(
    index,
    "ml/vector_search/contract_index.faiss"
)

print(
    "Index Built Successfully"
)

print(
    "Vectors:",
    index.ntotal
)