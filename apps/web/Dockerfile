# SDP Web — Next.js standalone build voor productie
# Geoptimaliseerd voor Haven-Suriname (Kubernetes-compatible).

# ─── Stage 1: build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

RUN corepack enable pnpm && pnpm install --frozen-lockfile --filter @sdp/web...

COPY apps/web ./apps/web
WORKDIR /repo/apps/web

# NEXT_PUBLIC_* vars worden ge-inlined; geef ze mee via build args
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ARG NEXT_PUBLIC_APP_NAME="SDP — Suriname Decentralisatie Platform"
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME

RUN pnpm build

# ─── Stage 2: runtime (Next standalone) ───────────────────────
FROM node:20-alpine AS runtime

RUN apk add --no-cache tini
RUN addgroup -g 1001 -S sdp && adduser -u 1001 -S sdp -G sdp

WORKDIR /app

# Standalone build heeft eigen minimal node_modules
COPY --from=builder --chown=sdp:sdp /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=sdp:sdp /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=sdp:sdp /repo/apps/web/public ./apps/web/public

USER sdp

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/web/server.js"]
