# Multi-stage Dockerfile for Wine Lottery App

# Stage 1: Build frontend with pnpm
FROM node:20-alpine AS frontend-builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json ./

# Install dependencies
RUN pnpm install

# Copy source and build
COPY frontend/ ./
RUN pnpm build

# Stage 2: Python runtime with uv
FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy and install Python dependencies with uv
COPY backend/requirements.txt ./
RUN uv pip install --system --no-cache -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./staticfiles/frontend

# Create data directory for SQLite
RUN mkdir -p /data

# Set environment variables
ENV DJANGO_SETTINGS_MODULE=vinlotteri.settings
ENV DATABASE_PATH=/data/db.sqlite3
ENV DJANGO_DEBUG=False
ENV PYTHONUNBUFFERED=1

# Collect static files
RUN python manage.py collectstatic --noinput

# Copy and set up entrypoint
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

ENTRYPOINT ["/start.sh"]
