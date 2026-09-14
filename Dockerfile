# Stage 1: Build frontend and backend bundles
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/public-pages.json ./
COPY --from=builder /app/firebase-applet-config.json* ./
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
