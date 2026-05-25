# SDP API — single-stage productie-image (runtime via tsx)
# Geen tsc build-stap nodig — tsx transpileert on-import (esbuild).
# Cold start +1-2s, geen build-bugs, deterministisch over OS/container.

FROM node:20-bookworm-slim

# Argon2 + Prisma vereisen build tools (alleen tijdens install, kunnen erin blijven
# voor demo-image; voor productie aparte multi-stage indien gewenst).
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl ca-certificates tini wget \
  && rm -rf /var/lib/apt/lists/*

# Niet-root user
RUN groupadd -g 1001 -r sdp && useradd -u 1001 -r -g sdp sdp

WORKDIR /repo

# Workspace bestanden (pnpm)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Source code
COPY apps/api ./apps/api
WORKDIR /repo/apps/api

# Prisma client genereren (vereist door @prisma/client imports in src)
RUN pnpm prisma generate

# ts-node globaal: gebruikt echte tsc voor full decorator metadata (NestJS DI vereist dat).
# tsx/esbuild emit-metadata is incompleet → DI faalt op sommige services.
RUN npm install -g ts-node@10 typescript@5.4 tsconfig-paths@4

# Permissies voor non-root user
RUN chown -R sdp:sdp /repo

USER sdp

ENV NODE_ENV=production
ENV API_PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/api/health || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["ts-node", "--transpile-only", "-r", "tsconfig-paths/register", "src/main.ts"]
