# syntax=docker/dockerfile:1
# Build : docker build -f setup/Dockerfile .
# Le contexte DOIT être la racine du repo (voir setup/.dockerignore).

ARG NODE_VERSION=22.15.0

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat openssl wget
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM base AS builder
ARG NEXT_PUBLIC_APP_URL=https://id-foot.kobecorporation.com
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Valeurs factices pour le build (runtime injecté via --env-file sur le VPS)
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public
ENV NEXTAUTH_SECRET=build-time-placeholder-not-for-production
ENV NEXTAUTH_URL=https://id-foot.kobecorporation.com

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static
COPY setup/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh \
  && mkdir -p public/uploads/photos \
  && chown -R nextjs:nodejs public/uploads

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

ENTRYPOINT ["./entrypoint.sh"]
