FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    poppler-utils \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY backend/requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY backend/app ./app
COPY backend/init_db.py .
COPY backend/merge_and_migrate.py .
COPY backend/migrate_add_risk_score.py .

# Copy ML
COPY ml ./ml

# Create required folders
RUN mkdir -p uploads
RUN mkdir -p app/instance

EXPOSE 5000

CMD ["python", "app/main.py"]