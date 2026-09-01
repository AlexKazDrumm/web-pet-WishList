# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
RUN npm ci
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
RUN npm run build --workspace @wishlist/backend \
  && npm prune --omit=dev

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo/apps/backend
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /repo/node_modules /repo/node_modules
COPY --from=build /repo/package.json /repo/package.json
COPY --from=build /repo/packages/shared /repo/packages/shared
COPY --from=build /repo/apps/backend/dist ./dist
COPY --from=build /repo/apps/backend/src/db/migrations ./src/db/migrations
COPY --from=build /repo/apps/backend/package.json ./package.json
COPY docker/backend-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
  && mkdir -p /repo/apps/backend/var/uploads /data/uploads \
  && chown -R app:app /repo /data
USER app
EXPOSE 3031
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/server.js"]
