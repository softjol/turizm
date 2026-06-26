# syntax=docker/dockerfile:1

# --- Stage 1: build the Vite SPA --------------------------------------------
# The project is managed with Bun (bun.lock / bunfig.toml), so build with Bun.
FROM oven/bun:1-alpine AS build

WORKDIR /app

# Install deps from the lockfile first (better layer caching).
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Vite bakes these into the bundle at BUILD time. Defaults make the app talk to
# the backend through the nginx reverse proxy on the same origin, so no domain
# needs to be known ahead of time.
ARG VITE_API_URL=/api/v1
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN bun run build

# --- Stage 2: serve static files + proxy the API ----------------------------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
