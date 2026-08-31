# syntax=docker/dockerfile:1
# ---- Build stage ----
# The reference app is the "Netflix clone" React app. It needs a TMDB v3 API key
# injected at build time as REACT_APP_TMDB_V3_API_KEY.
FROM node:18-alpine AS build
WORKDIR /app

# TMDB key comes from CI as a build-arg (wired from the GitHub Actions secret)
ARG TMDB_V3_API_KEY
ENV REACT_APP_TMDB_V3_API_KEY=$TMDB_V3_API_KEY

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime
# Non-root hardening + only the static build is shipped (smaller attack surface for Trivy)
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
