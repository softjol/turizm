#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations (alembic upgrade head)..."
alembic upgrade head

if [ "${SEED_DEMO}" = "1" ]; then
  echo "[entrypoint] SEED_DEMO=1 -> seeding demo catalog (seed.py)..."
  python seed.py
fi

echo "[entrypoint] Starting API server on :8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
