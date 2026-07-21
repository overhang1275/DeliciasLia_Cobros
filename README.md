# Delicias Lia Cobros

## Descripción

Aplicación web privada para administrar cobros, ventas, créditos, clientes, productos, pedidos y reportes financieros de Delicias Lia. Está construida como una PWA con Next.js, React, Prisma y SQLite.

La app incluye login de administrador, tablero inicial, registro de ventas rápidas, control de fiados y pagos parciales, estados de cuenta públicos por cliente, catálogo de productos, pedidos pendientes, configuración del negocio y reportes financieros con métricas listas para tomar decisiones sin depender de una descarga a Excel.

## Objetivo

Centralizar la operación diaria del negocio: vender, cobrar, registrar deuda, dar seguimiento a clientes, revisar inventario, convertir pedidos en ventas o créditos y consultar indicadores financieros claros para decidir qué cobrar, qué producto reponer y qué margen está dejando la operación.

## Tecnologías

- Next.js 15
- React 19
- TypeScript
- Prisma 6
- SQLite
- Tailwind CSS 3
- Motion
- Lucide React
- next-pwa
- React Hook Form
- Zod
- Chart.js
- ESLint

## Requisitos

- Node.js 20 o superior; los scripts de Ubuntu/LXC instalan Node.js 22 por defecto.
- npm
- SQLite mediante Prisma
- En despliegue Ubuntu/LXC: `bash`, `git`, `curl`, `build-essential`, `openssl` y `systemd`

## Uso

Instalar dependencias:

```bash
npm install
```

Crear `.env` tomando como base `.env.example`:

```env
DATABASE_URL="file:../database/database.sqlite"
ADMIN_PASSWORD="cambiar-esta-contrasena"
AUTH_SECRET="cambiar-por-un-secreto-largo"
AUTH_SECURE_COOKIE="false"
PORT="3000"
```

Preparar base de datos:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Iniciar en desarrollo:

```bash
npm run dev
```

Construir y ejecutar en producción:

```bash
npm run build
npm run start
```

El usuario inicial es `admin`. La contraseña se toma de `ADMIN_PASSWORD` durante el seed; si falta, el seed genera una contraseña temporal y la imprime en consola.

Rutas principales:

- `/login`: acceso de administrador.
- `/`: tablero inicial con créditos por cobrar, cambios pendientes, clientes, productos y accesos rápidos.
- `/ventas`: registro de venta rápida, ventas pagadas, fiadas o parciales y cambio pendiente.
- `/fiados`: registro, búsqueda, pago, liquidación y eliminación con confirmación sostenida.
- `/clientes`: alta, búsqueda, edición, historial y estado de cuenta.
- `/estado/[token]`: estado de cuenta público por cliente con pagos en verde y cargos/deuda en rojo.
- `/productos`: alta y búsqueda de productos.
- `/pedidos`: alta, búsqueda, conversión a venta/crédito y cancelación de pedidos.
- `/reportes`: ventas, utilidad, margen, cobros, deuda, inventario, pedidos, top clientes, productos rentables, formas de pago y tipo de venta.
- `/configuracion`: logo, nombre del negocio y datos bancarios.
- `/api/health`: verificación simple de salud.

La interfaz usa iconos de Lucide y animaciones sutiles con Motion en las rutas.

## Despliegue

El repositorio incluye scripts para instalar, actualizar y levantar un demo en Ubuntu/LXC con `systemd`.

Instalación inicial:

```bash
sudo ADMIN_PASSWORD="cambiar-esta-contrasena" bash scripts/install-ubuntu-lxc.sh
```

El script clona o actualiza el repo en `/opt/delicias-lia`, crea el usuario de sistema `deliciaslia`, escribe `.env`, ejecuta `npm ci`, genera Prisma Client, aplica migraciones, ejecuta seed, construye la app y crea el servicio `delicias-lia`.

Actualizar una instalación existente:

```bash
sudo bash scripts/update-ubuntu-lxc.sh
```

Antes de actualizar, el script respalda `database/database.sqlite` si existe. Después ejecuta `npm ci`, `prisma generate`, `prisma migrate deploy`, `npm run build` y reinicia el servicio.

Levantar un demo separado:

```bash
sudo bash scripts/demo-ubuntu-lxc.sh
```

El demo usa `/opt/delicias-lia-demo`, servicio `delicias-lia-demo`, puerto `3001`, usuario `admin` y password `demo12345` por defecto. Este script borra y vuelve a crear solo la base del demo.

Variables aceptadas por los scripts:

- `REPO_URL`: repositorio a clonar; por defecto `https://github.com/overhang1275/DeliciasLia_Cobros.git`.
- `APP_DIR`: ruta de instalación; por defecto `/opt/delicias-lia`.
- `APP_USER`: usuario del servicio; por defecto `deliciaslia`.
- `PORT`: puerto de Next.js; por defecto `3000`.
- `SERVICE_NAME`: nombre del servicio systemd; por defecto `delicias-lia`.
- `NODE_MAJOR`: versión mayor de Node.js a instalar; por defecto `22`.

## Variables de entorno

- `DATABASE_URL`: requerida por Prisma. En el repo se usa `file:../database/database.sqlite`.
- `ADMIN_PASSWORD`: contraseña inicial del usuario `admin` durante `npm run prisma:seed`. Si falta, se genera una temporal y se imprime en consola.
- `AUTH_SECRET`: secreto para firmar la cookie de sesión. Si falta, el código usa `delicias-lia-dev-secret`, solo adecuado para desarrollo.
- `AUTH_SECURE_COOKIE`: usa cookie segura cuando vale `true`.
- `ALLOW_DEMO_RESET`: requerida con valor `1` para ejecutar `prisma/demo-seed.ts`; el script demo la escribe automáticamente.
- `NODE_ENV`: usado por Next.js y para desactivar PWA en desarrollo.
- `PORT`: usado por Next.js y por los servicios de producción en los scripts de despliegue.

## Responsable
Este proyecto es desarrollado y mantenido por:

- **GitHub:** [@overhang1275](https://github.com/overhang1275)

## Estado

Proyecto privado en versión `0.1.0`. Cuenta con migraciones Prisma, seed inicial, seed demo, scripts de desarrollo, build, lint, migración, despliegue Ubuntu/LXC y demo Ubuntu/LXC. No se encontraron scripts de pruebas automatizadas.
