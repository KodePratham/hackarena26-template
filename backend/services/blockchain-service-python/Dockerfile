FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy smart contracts for PyTeal compilation
COPY ../../blockchain/contracts /contracts

# Expose port
EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; r = requests.get('http://localhost:3006/health'); exit(0 if r.status_code == 200 else 1)"

# Run with gunicorn in production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:3006", "--timeout", "120", "app:app"]
