#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/delicias-lia}"
APP_USER="${APP_USER:-deliciaslia}"
SERVICE_NAME="${SERVICE_NAME:-delicias-lia}"
APP_TZ="${APP_TZ:-America/Mexico_City}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta como root: sudo bash $0"
  exit 1
fi

if [ ! -d "$APP_DIR/.git" ]; then
  echo "No existe repo en $APP_DIR. Ejecuta primero install-ubuntu-lxc.sh"
  exit 1
fi

git config --global --add safe.directory "$APP_DIR"
git -C "$APP_DIR" fetch --quiet
HAS_UPDATE="1"
if [ "$(git -C "$APP_DIR" rev-parse HEAD)" = "$(git -C "$APP_DIR" rev-parse @{u})" ]; then
  HAS_UPDATE="0"
fi

if [ "$HAS_UPDATE" = "1" ] && [ -f "$APP_DIR/database/database.sqlite" ]; then
  cp -a "$APP_DIR/database/database.sqlite" "$APP_DIR/database/database.backup-before-update-$(date +%Y%m%d-%H%M%S).sqlite"
fi

if [ "$HAS_UPDATE" = "1" ]; then
  systemctl stop "$SERVICE_NAME" || true
fi

SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
if [ -f "$SERVICE_FILE" ] && ! grep -q '^Environment=TZ=' "$SERVICE_FILE"; then
  sed -i "/^Environment=PORT=/a Environment=TZ=${APP_TZ}" "$SERVICE_FILE"
  systemctl daemon-reload
fi

if [ "$HAS_UPDATE" = "1" ]; then
  git -C "$APP_DIR" pull --ff-only
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

if [ "$HAS_UPDATE" = "1" ]; then
  runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm ci"
fi
if ! grep -q '^TZ=' "$APP_DIR/.env"; then
  echo "TZ=\"${APP_TZ}\"" >> "$APP_DIR/.env"
fi
if ! grep -q '^NEXT_PUBLIC_BASE_URL=' "$APP_DIR/.env"; then
  echo "NEXT_PUBLIC_BASE_URL=\"${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}\"" >> "$APP_DIR/.env"
fi
if ! grep -q '^VAPID_PUBLIC_KEY=' "$APP_DIR/.env" || ! grep -q '^VAPID_PRIVATE_KEY=' "$APP_DIR/.env"; then
  if [ ! -d "$APP_DIR/node_modules/web-push" ]; then
    runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm ci"
  fi
  VAPID_KEYS="$(runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx web-push generate-vapid-keys --json")"
  VAPID_PUBLIC_KEY="$(printf '%s' "$VAPID_KEYS" | sed -n 's/.*"publicKey"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
  VAPID_PRIVATE_KEY="$(printf '%s' "$VAPID_KEYS" | sed -n 's/.*"privateKey"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
  {
    echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=\"${VAPID_PUBLIC_KEY}\""
    echo "VAPID_PUBLIC_KEY=\"${VAPID_PUBLIC_KEY}\""
    echo "VAPID_PRIVATE_KEY=\"${VAPID_PRIVATE_KEY}\""
    echo "VAPID_SUBJECT=\"${VAPID_SUBJECT:-mailto:admin@delicias-lia.local}\""
  } >> "$APP_DIR/.env"
  chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
  chmod 600 "$APP_DIR/.env"
fi
if ! grep -q '^NEXT_PUBLIC_VAPID_PUBLIC_KEY=' "$APP_DIR/.env"; then
  VAPID_PUBLIC_KEY="$(grep '^VAPID_PUBLIC_KEY=' "$APP_DIR/.env" | tail -n1 | cut -d= -f2- | tr -d '"')"
  echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=\"${VAPID_PUBLIC_KEY}\"" >> "$APP_DIR/.env"
fi
if ! grep -q '^VAPID_SUBJECT=' "$APP_DIR/.env"; then
  echo "VAPID_SUBJECT=\"${VAPID_SUBJECT:-mailto:admin@delicias-lia.local}\"" >> "$APP_DIR/.env"
fi

if [ "$HAS_UPDATE" = "0" ]; then
  echo "No hay actualizaciones disponibles. Variables faltantes revisadas."
  exit 0
fi

runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx prisma generate"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx prisma migrate deploy"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm run build"

systemctl start "$SERVICE_NAME"

echo
echo "Actualizado sin borrar la base."
echo "Servicio: systemctl status ${SERVICE_NAME}"
