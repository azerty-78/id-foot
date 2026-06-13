# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.15.0

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM base AS builder
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

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

ENTRYPOINT ["./entrypoint.sh"]
