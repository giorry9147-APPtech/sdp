# SDP API — multi-stage productie-build
# Geoptimaliseerd voor Haven-Suriname (Kubernetes-compatible).

# ─── Stage 1: build ───────────────────────────────────────────
FROM node:20-alpine AS builder

# Argon2 + Prisma vereisen build tools
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /repo

# Workspace bestanden (pnpm)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN corepack enable pnpm && pnpm install --frozen-lockfile --filter @sdp/api...

COPY apps/api ./apps/api
WORKDIR /repo/apps/api

RUN pnpm prisma generate
RUN pnpm build

# ─── Stage 2: runtime ─────────────────────────────────────────
FROM node:20-alpine AS runtime

RUN apk add --no-cache openssl tini

# Niet-root user
RUN addgroup -g 1001 -S sdp && adduser -u 1001 -S sdp -G sdp

WORKDIR /app

# Alleen wat nodig is in runtime
COPY --from=builder --chown=sdp:sdp /repo/apps/api/package.json ./
COPY --from=builder --chown=sdp:sdp /repo/apps/api/dist ./dist
COPY --from=builder --chown=sdp:sdp /repo/apps/api/prisma ./prisma
COPY --from=builder --chown=sdp:sdp /repo/node_modules ./node_modules

USER sdp

ENV NODE_ENV=production
ENV API_PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/api/docs || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
