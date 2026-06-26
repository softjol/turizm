# syntax=docker/dockerfile:1
FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install Python deps first so they cache between code changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code.
COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 8000

# Entrypoint runs DB migrations (and optional demo seed), then starts uvicorn.
ENTRYPOINT ["./docker-entrypoint.sh"]
