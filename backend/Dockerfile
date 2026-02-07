# Build Stage
FROM python:3.9-slim as builder

# Install build dependencies for dlib and psycopg2
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
# We split this to cache the expensive dlib compile
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Final Stage
FROM python:3.9-slim

WORKDIR /app

# Install runtime dependencies (libgl1 is needed for some cv2 versions even headless sometimes, but strict headless shouldn't)
# We install libgomp1 which is often needed by dlib/numpy
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libgtk-3-0 \
    libopenblas0 \
    liblapack3 \
    libx11-6 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Environment setup
ENV PYTHONPATH=/app
ENV PORT=10000

# Run API
# Run API
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
