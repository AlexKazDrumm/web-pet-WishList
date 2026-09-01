#!/bin/sh
set -e

echo "Applying database migrations…"
npm run migrate:prod

if [ "${RUN_SEED}" = "true" ]; then
  echo "Seeding database…"
  node dist/db/seed.js
fi

echo "Starting API…"
exec "$@"
