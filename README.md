# Delicias Lia Cobros

## Descripción

Aplicación web privada para administrar ventas, fiados, pagos, clientes, productos, pedidos y reportes de Delicias Lia. Está construida como una PWA con Next.js, React, Prisma y SQLite.

El sistema incluye acceso de administrador, tablero de inicio, registro de ventas rápidas, control de fiados y pagos parciales, estados de cuenta por cliente, catálogo de productos, pedidos pendientes, reportes de ventas/cobros/utilidad y configuración del negocio con logo y datos bancarios.

## Objetivo

Centralizar el cobro diario del negocio y dar seguimiento a dinero pendiente por cobrar, cambios pendientes por entregar, clientes activos, productos registrados, pedidos y reportes básicos de operación.

## Tecnologías

- Next.js 15
- React 19
- TypeScript
- Prisma 6
- SQLite
- Tailwind CSS 3
- next-pwa
- Zod
- React Hook Form
- ESLint

## Requisitos

- Node.js 20 o superior; el script de instalación para Ubuntu usa Node.js 22 por defecto.
- npm
- SQLite mediante Prisma
- En despliegue Ubuntu/LXC: `bash`, `git`, `curl`, `build-essential`, `openssl` y `systemd`

## Uso

Instalar dependencias:

```bash
npm install
```

Crear `.env` con la base de datos local:

```env
DATABASE_URL="file:../database/database.sqlite"
```

Generar Prisma Client, aplicar migraciones y sembrar datos iniciales:

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

El usuario inicial es `admin`. La contraseña se toma de `ADMIN_PASSWORD` durante el seed; si no existe, el seed genera una contraseña aleatoria y la imprime en consola.

Rutas principales:

- `/login`: acceso de administrador.
- `/`: tablero con fiados por cobrar, cambios pendientes, clientes y productos.
- `/ventas`: registro de venta rápida y últimas ventas.
- `/fiados`: registro, búsqueda, pago, liquidación y eliminación de fiados.
- `/clientes`: alta, búsqueda, edición y estado de cuenta de clientes.
- `/productos`: alta y búsqueda de productos.
- `/pedidos`: alta, búsqueda, conversión a venta/fiado y cancelación de pedidos.
- `/reportes`: ventas, cobros, por cobrar, utilidad, productos vendidos y clientes con deuda.
- `/configuracion`: logo, nombre del negocio y datos bancarios.
- `/api/health`: verificación simple de salud.

## Despliegue

El repositorio incluye scripts para instalar y actualizar la aplicación en un Ubuntu/LXC con `systemd`.

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

El demo usa `/opt/delicias-lia-demo`, el servicio `delicias-lia-demo`, el puerto `3001`, usuario `admin` y password `demo12345` por defecto. Este script borra y vuelve a crear solo la base del demo.

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
- `NODE_ENV`: usado por Next.js y para desactivar PWA en desarrollo.
- `PORT`: usado por el servicio de producción en los scripts de despliegue.

## Responsable

No especificado en el repositorio.

## Estado

Proyecto privado en versión `0.1.0`. Cuenta con migraciones Prisma, seed inicial, scripts de desarrollo, build, lint, migración, seed y despliegue Ubuntu/LXC. No se encontraron scripts de pruebas automatizadas.
