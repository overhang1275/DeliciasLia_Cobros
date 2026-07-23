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
if [ "$(git -C "$APP_DIR" rev-parse HEAD)" = "$(git -C "$APP_DIR" rev-parse @{u})" ]; then
  echo "No hay actualizaciones disponibles."
  exit 0
fi

if [ -f "$APP_DIR/database/database.sqlite" ]; then
  cp -a "$APP_DIR/database/database.sqlite" "$APP_DIR/database/database.backup-before-update-$(date +%Y%m%d-%H%M%S).sqlite"
fi

systemctl stop "$SERVICE_NAME" || true

SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
if [ -f "$SERVICE_FILE" ] && ! grep -q '^Environment=TZ=' "$SERVICE_FILE"; then
  sed -i "/^Environment=PORT=/a Environment=TZ=${APP_TZ}" "$SERVICE_FILE"
  systemctl daemon-reload
fi

git -C "$APP_DIR" pull --ff-only
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm ci"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx prisma generate"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx prisma migrate deploy"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm run build"

systemctl start "$SERVICE_NAME"

echo
echo "Actualizado sin borrar la base."
echo "Servicio: systemctl status ${SERVICE_NAME}"
