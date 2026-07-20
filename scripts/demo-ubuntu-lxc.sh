#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/overhang1275/DeliciasLia_Cobros.git}"
APP_DIR="${APP_DIR:-/opt/delicias-lia-demo}"
APP_USER="${APP_USER:-deliciaslia-demo}"
PORT="${PORT:-3001}"
SERVICE_NAME="${SERVICE_NAME:-delicias-lia-demo}"
NODE_MAJOR="${NODE_MAJOR:-22}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-demo12345}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta como root: sudo bash $0"
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl git build-essential openssl

if ! command -v node >/dev/null || ! node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)"; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"
fi

mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git config --global --add safe.directory "$APP_DIR"
  git -C "$APP_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$APP_DIR"
fi

mkdir -p "$APP_DIR/database"
rm -f "$APP_DIR/database/database.sqlite" "$APP_DIR/database/database.sqlite-journal" "$APP_DIR/database/database.sqlite-wal" "$APP_DIR/database/database.sqlite-shm"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

AUTH_SECRET="${AUTH_SECRET:-$(openssl rand -hex 32)}"
cat > "$APP_DIR/.env" <<ENV
DATABASE_URL="file:../database/database.sqlite"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_SECURE_COOKIE="${AUTH_SECURE_COOKIE:-false}"
ADMIN_PASSWORD="${ADMIN_PASSWORD}"
ALLOW_DEMO_RESET="1"
ENV
chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm ci"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx prisma generate"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx prisma migrate deploy"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx tsx prisma/demo-seed.ts"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm run build"

cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<SERVICE
[Unit]
Description=Delicias Lia Cobros Demo
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PORT=${PORT}
ExecStart=/usr/bin/npm run start -- -H 0.0.0.0 -p ${PORT}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"

echo
echo "Demo levantado."
echo "URL local: http://$(hostname -I | awk '{print $1}'):${PORT}"
echo "Usuario: admin"
echo "Password: ${ADMIN_PASSWORD}"
echo "Servicio: systemctl status ${SERVICE_NAME}"
