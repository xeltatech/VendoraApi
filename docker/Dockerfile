# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN yarn prisma:generate

# Build application
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install Chromium and dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

# Set Puppeteer environment
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/templates ./templates

# Create directories for storage
RUN mkdir -p /tmp/vendora-pdfs /app/logs && \
    chown -R node:node /app /tmp/vendora-pdfs

USER node

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start the app
CMD ["sh", "-c", "yarn prisma:migrate:prod && node dist/main"]
