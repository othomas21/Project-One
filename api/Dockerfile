# MedGemma Local Inference Service Dockerfile
# @reftools Verified against Python 3.11 and CUDA compatibility
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY medgemma-local.py .

# Create directories for model cache
RUN mkdir -p /app/models /app/cache
ENV TRANSFORMERS_CACHE=/app/cache
ENV HF_HOME=/app/cache

# Set environment variables
ENV PYTHONPATH=/app
ENV FLASK_APP=medgemma-local.py
ENV PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "medgemma-local.py"]