# ── Stage 1: Build Frontend ──
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend/ ./
RUN npm run build

# ── Stage 2: Production Backend Runtime ──
FROM node:20-alpine
WORKDIR /app

COPY Backend/package*.json ./
RUN npm ci --omit=dev

COPY Backend/ ./
# Copy compiled Frontend dist directly into Backend/public for unified serving
COPY --from=frontend-builder /app/frontend/dist ./public

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV SERVE_FRONTEND=true

CMD ["node", "server.js"]
