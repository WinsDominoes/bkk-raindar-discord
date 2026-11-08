# syntax=docker/dockerfile:1
ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:${NODE_VERSION}
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Radar image is persisted here (mount a volume to keep it across rebuilds).
RUN mkdir -p data && chown node:node data
VOLUME /app/data

USER node
CMD ["node", "src/index.js"]
