# Stage 1: Build React + Vite Frontend (including PWA sw.js & manifest.json)
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production FastAPI + ML + Built Frontend Container
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY ml/saved_models/ ./ml/saved_models/
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

RUN mkdir -p /app/backend/app/static/uploads

WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

