#!/bin/sh
set -e

export FONTCONFIG_FILE="${FONTCONFIG_FILE:-/usr/src/app/assets/fonts/fonts.conf}"
export FONTCONFIG_PATH="${FONTCONFIG_PATH:-/usr/src/app/assets/fonts}"

echo "Application des migrations Prisma..."
npx prisma migrate deploy

echo "Demarrage de l'application..."
exec node server.js
