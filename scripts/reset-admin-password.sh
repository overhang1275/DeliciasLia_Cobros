#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/delicias-lia}"
APP_USER="${APP_USER:-deliciaslia}"

if [ ! -f "$APP_DIR/package.json" ]; then
  echo "No existe la app en $APP_DIR."
  echo "Usa: APP_DIR=/ruta/de/la/app $0"
  exit 1
fi

cd "$APP_DIR"

if [ "$(id -u)" -eq 0 ]; then
  runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm run admin:reset-password"
else
  npm run admin:reset-password
fi
