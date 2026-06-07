#!/bin/sh
set -e

cd /app/server

npx prisma migrate deploy

node dist/index.js &

nginx -g 'daemon off;'
