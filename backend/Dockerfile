# ---- Build ----
FROM python:3.12-slim AS builder
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app
COPY pyproject.toml ./
COPY app ./app
RUN pip install --prefix=/install --no-cache-dir .

# ---- Runtime ----
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
COPY --from=builder /install /usr/local
WORKDIR /app
COPY app ./app
# Migrations travel with the image so the schema can be brought up to date at start-up
COPY alembic ./alembic
COPY alembic.ini ./
RUN useradd --create-home appuser
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f\"http://localhost:{os.environ.get('PORT', '8000')}/health\")"
# Apply pending migrations, load the demo data if asked (it skips a database that already has
# users), then serve. Behind a platform proxy, --proxy-headers gives the real client IP that the
# login rate limit counts by; PORT is set by the platform, 8000 otherwise.
CMD ["sh", "-c", "alembic upgrade head && if [ \"$SEED_DEMO_DATA\" = true ]; then python -m app.db.seed; fi && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
