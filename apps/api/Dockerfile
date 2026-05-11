# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/ ./apps/api/
COPY packages/shared/src/ ./packages/shared/src/

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Build API
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy prisma schema
COPY apps/api/prisma/ ./apps/api/prisma/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/index.js"]