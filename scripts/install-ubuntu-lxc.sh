#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/overhang1275/DeliciasLia_Cobros.git}"
APP_DIR="${APP_DIR:-/opt/delicias-lia}"
APP_USER="${APP_USER:-deliciaslia}"
PORT="${PORT:-3000}"
SERVICE_NAME="${SERVICE_NAME:-delicias-lia}"
NODE_MAJOR="${NODE_MAJOR:-22}"

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
  git -C "$APP_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$APP_DIR"
fi

mkdir -p "$APP_DIR/database"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

if [ -z "${ADMIN_PASSWORD:-}" ]; then
  read -rsp "Password inicial para admin: " ADMIN_PASSWORD
  echo
fi

if [ -z "$ADMIN_PASSWORD" ]; then
  echo "ADMIN_PASSWORD no puede estar vacio."
  exit 1
fi

AUTH_SECRET="${AUTH_SECRET:-$(openssl rand -hex 32)}"
AUTH_SECURE_COOKIE="${AUTH_SECURE_COOKIE:-false}"
cat > "$APP_DIR/.env" <<ENV
DATABASE_URL="file:../database/database.sqlite"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_SECURE_COOKIE="${AUTH_SECURE_COOKIE}"
ADMIN_PASSWORD="${ADMIN_PASSWORD}"
ENV
chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm ci"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx prisma generate"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npx prisma migrate deploy"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm run prisma:seed"
runuser -u "$APP_USER" -- bash -lc "cd '$APP_DIR' && npm run build"

cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<SERVICE
[Unit]
Description=Delicias Lia Cobros
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
echo "Instalado."
echo "URL local: http://$(hostname -I | awk '{print $1}'):${PORT}"
echo "Usuario: admin"
echo "Servicio: systemctl status ${SERVICE_NAME}"
