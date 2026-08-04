# Delicias Lia Cobros

Aplicacion web privada para administrar ventas, credito, pagos, clientes, productos, pedidos, cambios pendientes y estados de cuenta. Esta pensada para negocios pequenos que venden productos por pieza, registran ventas de contado o a credito y necesitan saber rapidamente quien debe, cuanto debe y que se cobro en el dia.

La app esta construida como PWA con Next.js, React, Prisma y SQLite. El acceso administrativo esta protegido por usuario y contrasena; los clientes solo pueden consultar su estado de cuenta mediante un enlace publico con token.

## Funciones principales

- **Inicio:** resumen operativo con credito por cobrar, cambios pendientes, ventas del dia, clientes y productos.
- **Ventas:** registro de ventas de contado o credito, forma de pago, piezas, producto y cambio pendiente por entregar.
- **Credito:** registro manual de deuda, pago por ticket, liquidacion de deuda, eliminacion con confirmacion y filtros.
- **Cambios:** listado de cambios pendientes por entregar y marcado de cambio entregado.
- **Clientes:** alta, busqueda, edicion, historial, estado de cuenta y eliminacion.
- **Productos:** catalogo simple de productos vendidos, con precio de venta.
- **Pedidos:** registro de encargos por cliente, producto, piezas y fecha de entrega; pueden convertirse despues en venta o credito.
- **Estado de cuenta:** vista publica por token, movimientos agrupados por fecha, pagos, creditos, cambios pendientes, deposito y exportacion.
- **Reportes:** ventas por dia, cobrado vs credito, cambios pendientes, clientes que mas compran, clientes que mas deben, pagos por periodo, forma de pago y corte del periodo.
- **Configuracion:** datos del negocio, logo, datos bancarios, tema claro/oscuro/sistema, seguridad, notificaciones y auditoria.
- **Notificaciones:** push web para recordatorios de saldo pendiente.
- **APIs para automatizacion:** endpoints protegidos para N8N/Evolution API.

## Arquitectura

- **Framework:** Next.js 15 con App Router.
- **UI:** React 19, Tailwind CSS, Motion y Lucide React.
- **Datos:** Prisma 6 con SQLite.
- **Validacion:** Zod y React Hook Form.
- **PWA:** `next-pwa`, manifest dinamico, logo desde configuracion y `robots.txt` bloqueando indexacion.
- **Sesion:** cookie firmada propia para usuario admin.
- **Estado publico:** acceso por token unico en `/estado/[token]`.
- **Auditoria:** eventos importantes guardados en `AuditLog`.

La mayor parte del acceso a datos pasa por Prisma desde Server Components, Server Actions y API routes. El cliente publico no recibe secretos ni llaves privadas.

## Modelo de datos

Modelos principales en `prisma/schema.prisma`:

- `Cliente`: datos del cliente, telefono, notas, token publico y relaciones con ventas, pedidos y suscripciones push.
- `Producto`: catalogo de productos y precio.
- `Venta`: venta pagada, a credito, parcial o cancelada; incluye total, estado y cambio pendiente.
- `DetalleVenta`: productos y cantidades de cada venta.
- `Pago`: abonos asociados a una venta.
- `Pedido`: encargos pendientes o cancelados.
- `Configuracion`: nombre del negocio, logo, tema y datos de deposito.
- `Usuario`: usuario admin y hash de contrasena.
- `AuditLog`: registro de acciones relevantes.
- `PushSubscription`: suscripciones push por cliente.

## Requisitos

- Node.js 20 o superior.
- npm.
- Prisma CLI mediante dependencias del proyecto.
- SQLite.
- Para Ubuntu/LXC: `bash`, `git`, `curl`, `build-essential`, `openssl` y `systemd`.

Los scripts de instalacion para Ubuntu/LXC instalan Node.js 22 por defecto si el servidor no tiene una version compatible.

## Instalacion local

Instalar dependencias:

```bash
npm install
```

Crear `.env` desde `.env.example`:

```env
DATABASE_URL="file:../database/database.sqlite"
ADMIN_PASSWORD="cambiar-esta-contrasena"
AUTH_SECRET="cambiar-por-un-secreto-largo"
AUTH_SECURE_COOKIE="false"
PORT="3000"
TZ="America/Mexico_City"
NEXT_PUBLIC_BASE_URL="https://tu-dominio.com"
TUNNEL_URL="https://tu-tunnel.trycloudflare.com"
NEXT_PUBLIC_TUNNEL_URL="https://tu-tunnel.trycloudflare.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:admin@tu-dominio.com"
N8N_API_KEY="cambiar-por-un-token-largo"
```

Preparar Prisma y base de datos:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Levantar desarrollo:

```bash
npm run dev
```

Construir y ejecutar produccion local:

```bash
npm run build
npm run start
```

Usuario inicial:

- Usuario: `admin`
- Password: el valor de `ADMIN_PASSWORD` usado durante el seed.

## Comandos utiles

```bash
npm run dev                  # servidor de desarrollo
npm run build                # build de produccion
npm run start                # inicia build de produccion
npm run lint                 # eslint
npm run prisma:generate      # genera Prisma Client
npm run prisma:migrate       # migraciones en desarrollo
npm run prisma:deploy        # migraciones en produccion
npm run prisma:seed          # crea/configura usuario admin inicial
npm run push:weekly          # envia recordatorios push semanales
npm run admin:reset-password # genera nueva contrasena admin segura
```

Tambien existe:

```bash
bash scripts/reset-admin-password.sh
```

Ese script sirve para restablecer la contrasena admin directamente en servidor.

## Rutas principales

| Ruta | Descripcion |
| --- | --- |
| `/login` | Acceso administrativo. |
| `/` | Dashboard inicial. |
| `/ventas` | Nueva venta. |
| `/fiados` | Creditos y saldos pendientes. |
| `/fiados/[id]/pago` | Registro de pago por ticket. |
| `/cambios` | Cambios pendientes por entregar. |
| `/clientes` | Clientes activos, busqueda y acciones. |
| `/clientes/[id]/editar` | Edicion de cliente. |
| `/clientes/[id]/estado` | Estado de cuenta visto por admin. |
| `/clientes/[id]/historial` | Historial administrativo del cliente. |
| `/estado/[token]` | Estado de cuenta publico para cliente. |
| `/productos` | Catalogo de productos. |
| `/pedidos` | Pedidos por entregar. |
| `/reportes` | Analisis operativo y financiero. |
| `/configuracion` | Configuracion del sistema. |
| `/configuracion/log.txt` | Descarga de auditoria completa. |
| `/mas` | Accesos secundarios. |

## APIs

### Salud

```http
GET /api/health
```

Respuesta simple para verificar que la app responde.

### Logo

```http
GET /api/logo
```

Devuelve el logo configurado. Se usa tambien para PWA e iconos.

### N8N: deudores

```http
GET /api/n8n/deudores
Authorization: Bearer TU_N8N_API_KEY
```

Devuelve clientes activos con saldo pendiente, telefono y link publico de estado de cuenta. Pensado para flujos de recordatorio en N8N o Evolution API.

### N8N: corte del dia

```http
GET /api/n8n/corte-dia
Authorization: Bearer TU_N8N_API_KEY
```

Devuelve corte digital del dia: ventas, piezas, cobrado, efectivo, transferencia, credito generado, cambios pendientes y mensaje listo para enviar al admin.

### Push

```http
GET  /api/push/public-key
POST /api/push/subscribe
POST /api/push/unsubscribe
POST /api/push/send
```

Permiten activar/desactivar notificaciones push y enviar recordatorios cuando existe suscripcion.

## Variables de entorno

| Variable | Requerida | Descripcion |
| --- | --- | --- |
| `DATABASE_URL` | Si | Conexion Prisma. Por defecto SQLite: `file:../database/database.sqlite`. |
| `ADMIN_PASSWORD` | Seed | Contrasena inicial del usuario `admin`. |
| `AUTH_SECRET` | Produccion | Secreto para firmar cookies de sesion. Obligatorio en produccion. |
| `AUTH_SECURE_COOKIE` | No | Usar `true` cuando la app se publica por HTTPS. |
| `PORT` | No | Puerto de Next.js. |
| `TZ` | Recomendado | Zona horaria. Recomendado: `America/Mexico_City`. |
| `NEXT_PUBLIC_BASE_URL` | Recomendado | URL publica base para links. |
| `TUNNEL_URL` | Recomendado | URL publica preferente si se usa Cloudflare Tunnel. |
| `NEXT_PUBLIC_TUNNEL_URL` | No | Alias publico opcional del tunnel. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push | Llave publica VAPID para navegador. |
| `VAPID_PUBLIC_KEY` | Push | Llave publica VAPID server-side. |
| `VAPID_PRIVATE_KEY` | Push | Llave privada VAPID server-side. |
| `VAPID_SUBJECT` | Push | Contacto VAPID, por ejemplo `mailto:admin@dominio.com`. |
| `N8N_API_KEY` | APIs N8N | Token Bearer para endpoints de automatizacion. |
| `ALLOW_DEMO_RESET` | Demo | Permite resetear base demo cuando vale `1`. |
| `NODE_ENV` | Runtime | Usado por Next.js y PWA. |

## Despliegue Ubuntu/LXC

El repositorio incluye scripts para instalar, actualizar y levantar un demo con `systemd`.

### Instalacion inicial

```bash
sudo ADMIN_PASSWORD="cambiar-esta-contrasena" bash scripts/install-ubuntu-lxc.sh
```

Por defecto:

- Directorio: `/opt/delicias-lia`
- Usuario de sistema: `deliciaslia`
- Servicio: `delicias-lia`
- Puerto: `3000`

El script:

- instala dependencias del sistema;
- clona el repositorio;
- crea `.env`;
- instala paquetes con `npm ci`;
- genera Prisma Client;
- aplica migraciones;
- ejecuta seed;
- construye la app;
- registra el servicio systemd.

### Actualizacion

```bash
sudo bash scripts/update-ubuntu-lxc.sh
```

El script valida si hay cambios remotos. Si no hay cambios, cancela la actualizacion de build y solo revisa variables faltantes. Si hay cambios:

- respalda SQLite antes de actualizar;
- hace `git pull --ff-only`;
- instala dependencias;
- ejecuta `prisma generate`;
- ejecuta `prisma migrate deploy`;
- construye la app;
- reinicia el servicio.

### Demo

```bash
sudo bash scripts/demo-ubuntu-lxc.sh
```

Por defecto:

- Directorio: `/opt/delicias-lia-demo`
- Servicio: `delicias-lia-demo`
- Puerto: `3001`
- Usuario: `admin`
- Password: `demo12345`

El demo borra y recrea solo su propia base de datos.

## Seguridad

- La app administrativa requiere sesion.
- La cookie se firma con `AUTH_SECRET`.
- En produccion, `AUTH_SECRET` es obligatorio.
- El estado de cuenta publico usa token unico por cliente.
- Los endpoints N8N requieren `Authorization: Bearer`.
- Las llaves privadas VAPID no se exponen al frontend.
- `robots.txt` bloquea indexacion.
- La ruta publica de estado de cuenta no permite volver a la app admin si no hay sesion.

## Notificaciones

La estrategia completa esta documentada en:

[docs/roadmap-notificaciones.md](docs/roadmap-notificaciones.md)

Estado actual:

- Push web con `web-push`.
- Suscripciones por cliente.
- Recordatorio manual desde admin cuando aplica.
- Script semanal `npm run push:weekly`.
- Evolution API queda documentado como roadmap, no como integracion final obligatoria.

## Roadmaps

- [docs/roadmap-notificaciones.md](docs/roadmap-notificaciones.md): push, WhatsApp, Evolution API y recordatorios.
- [docs/ROADMAP.md](docs/ROADMAP.md): roadmap general de evolucion a Supabase.
- [docs/supabase-roadmap.md](docs/supabase-roadmap.md): plan especifico de migracion a Supabase.
- [docs/ui-ux-analysis.md](docs/ui-ux-analysis.md): criterios de UI/UX.

## Validacion antes de produccion

Comandos recomendados:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Smoke test recomendado:

- abrir `/login`;
- entrar como admin;
- revisar `/`, `/ventas`, `/fiados`, `/clientes`, `/productos`, `/pedidos`, `/reportes`, `/configuracion`;
- abrir un estado publico `/estado/[token]`;
- verificar que sin sesion las rutas admin redirigen a `/login`;
- verificar que `/api/n8n/deudores` y `/api/n8n/corte-dia` respondan `401` sin token.

## Estado del proyecto

Proyecto privado en version `0.1.0`.

Incluye:

- migraciones Prisma;
- seed inicial;
- seed demo;
- scripts de instalacion, actualizacion y demo para Ubuntu/LXC;
- PWA;
- APIs para automatizacion;
- notificaciones push;
- auditoria basica.

No hay suite formal de pruebas automatizadas configurada todavia. La validacion actual se basa en TypeScript, ESLint, build de Next.js y smoke tests manuales.

## Responsable

Desarrollado y mantenido por:

- GitHub: [@overhang1275](https://github.com/overhang1275)
