# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm safely globally
RUN npm install -g pnpm

# Copy package info
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Build static bundle
COPY . .
RUN pnpm build

# Production layer
FROM node:20-alpine AS runner
WORKDIR /app

# Enable standalone mode output tracking
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
CMD ["node", "server.js"]
