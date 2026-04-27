# syntax=docker/dockerfile:1.7

# ----- Build stage -------------------------------------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# System deps required by sharp (libvips) at install time.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prune dev deps for a smaller runtime image.
RUN npm prune --omit=dev

# ----- Runtime stage -----------------------------------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Sharp needs libvips at runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends libvips42 ca-certificates dumb-init \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY templates ./templates

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+process.env.PORT+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/api/index.js"]
