# Build context is the repository root.
# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /repo
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3031
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
RUN npm ci
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend
RUN npm run build --workspace @wishlist/frontend

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /repo/apps/frontend/.next/standalone ./
COPY --from=build /repo/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /repo/apps/frontend/public ./apps/frontend/public
USER app
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/frontend/server.js"]
