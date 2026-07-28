# Sprint 01 - Base de infraestructura y autenticación

## Resumen ejecutivo

Este sprint establece la base técnica de la migración: el sistema deja de depender del acceso directo a SQLite y pasa a un modelo de datos soportado por Supabase Postgres, con un punto de entrada común para autenticación, sesión y configuración. Su propósito es reducir riesgo desde el inicio, porque todos los módulos posteriores dependen de que la capa de datos y la seguridad funcionen correctamente. Al cerrarlo, la aplicación podrá abrirse en un entorno controlado con Supabase, validar sesión administrativa y operar sobre datos persistidos de forma remota. No resuelve todavía ventas, fiados ni reportes; sí desbloquea la migración del resto del sistema.

## Objetivo

Construir la infraestructura mínima necesaria para que la aplicación pueda ejecutar sus flujos administrativos sobre Supabase Postgres sin perder la experiencia actual de login, sesión y configuración. Este sprint debe dejar preparado el proveedor de datos, la gestión de sesión y la base del registro de auditoría, manteniendo la arquitectura actual de Next.js App Router y Prisma como capa de acceso.

## Alcance

### Módulos afectados

- autenticación administrativa
- middleware de protección de rutas
- configuración del negocio
- auditoría de acciones de administración
- salud del sistema

### Módulos no afectados

- ventas
- fiados
- pagos
- pedidos
- reportes
- estado de cuenta público en lógica de negocio

## Dependencias

### Requiere

- revisión del esquema actual de Prisma
- definición de variables de entorno de infraestructura
- validación del uso actual de cookies de sesión y rutas protegidas

### Desbloquea

- Sprint 02: catálogo y estado de cuenta
- Sprint 03: ventas y fiados
- Sprint 04: pedidos y reportes
- Sprint 05: cutover y estabilización

## Entregables

### Frontend (Next.js)

- [ ] Adaptar la capa de acceso a datos para que Server Components y Server Actions usen un proveedor único compatible con Supabase Postgres.
- [ ] Reemplazar la lógica de sesión local por un flujo compatible con la arquitectura de Supabase en entorno de servidor.
- [ ] Garantizar que las páginas de login, configuración y salud consuman el nuevo proveedor de datos sin romper el flujo actual.
- [ ] Mantener la experiencia de redirección a /login cuando no exista sesión válida.

### Backend / Supabase

- [ ] Definir el esquema lógico equivalente para Usuario, Configuracion y AuditLog en Postgres.
- [ ] Mapear los campos actuales de Prisma a tipos Postgres apropiados para texto, booleanos, timestamps y decimales.
- [ ] Ajustar el datasource de Prisma para trabajar con el motor remoto de Supabase.
- [ ] Asegurar que la tabla de auditoría pueda registrar acciones desde Server Actions con los mismos campos actuales.

### Infraestructura

- [ ] Definir variables de entorno para URL, anon key, service role key y connection string de Prisma.
- [ ] Ajustar la configuración de entorno y despliegue para que la app pueda iniciar con Supabase en desarrollo y producción.
- [ ] Preparar el flujo de seed y reset para la nueva base sin depender de SQLite local.

### Seguridad

- [ ] Definir políticas RLS para acceso administrativo a configuración y auditoría.
- [ ] Definir políticas RLS para la ruta pública de estado de cuenta, limitando el acceso al conjunto mínimo de columnas necesarias.
- [ ] Definir explícitamente el modelo de clientes de acceso: Prisma con service role solo para migraciones, seeds, scripts de fondo y /api/health; Supabase client con anon/JWT del usuario para Server Actions de negocio.
- [ ] Auditar cada Server Action y ruta crítica para confirmar que no mezcle un cliente de administración con un cliente de negocio en la misma operación.
- [ ] Mantener la protección existente de rutas a través del middleware y validar su compatibilidad con la nueva sesión.

### Migración de datos

- [ ] Preparar la carga inicial de usuario administrador, configuración por defecto y registros de auditoría vacíos.
- [ ] Definir el orden de carga para datos base y evitar dependencias de entidades de negocio aún no migradas.
- [ ] Documentar la estrategia de carga inicial desde el estado actual de SQLite.

### Observabilidad

- [ ] Registrar errores de conexión al proveedor de datos y de autenticación.
- [ ] Añadir trazabilidad básica para operaciones de configuración y login.
- [ ] Definir un formato consistente de logs para auditoría administrativa.

### Documentación

- [ ] Actualizar la documentación de entorno para incluir variables de Supabase y Prisma.
- [ ] Documentar el proceso de bootstrap inicial del sistema sobre la nueva base.

## Librerías nuevas

- nombre: @supabase/supabase-js
  propósito: integrar la app con Supabase para operaciones de backend y administración.
  motivo: la aplicación necesita un cliente oficial para trabajar con Postgres y servicios de autenticación.
  alternativas consideradas: usar solo Prisma con Postgres directo y no incorporar un cliente de Supabase; se rechaza porque la migración requiere una capa de infraestructura más alineada con la plataforma objetivo.
  impacto: alto, porque cambia la forma de inicializar y consumir datos desde el servidor.
  comando: npm install @supabase/supabase-js

- nombre: @supabase/ssr
  propósito: gestionar sesiones y cookies de forma segura en Next.js App Router.
  motivo: el flujo actual de autenticación está implementado manualmente y necesita compatibilidad robusta con los entornos de servidor.
  alternativas consideradas: mantener la lógica de cookies manual; se rechaza por la complejidad de compatibilidad con RLS y auth del proveedor.
  impacto: medio, porque afecta principalmente sesión, middleware y rutas protegidas.
  comando: npm install @supabase/ssr

## Archivos probablemente afectados

- package.json
- prisma/schema.prisma
- lib/db.ts
- lib/auth.ts
- lib/session.ts
- lib/configuracion.ts
- lib/audit.ts
- middleware.ts
- app/login/actions.ts
- app/configuracion/actions.ts
- app/configuracion/page.tsx
- app/configuracion/log.txt/route.ts
- app/api/health/route.ts
- .env.example
- prisma/seed.ts
- prisma/demo-seed.ts

## Riesgos

- Alto
  - causa: la sesión actual está acoplada a una lógica propia y no a un proveedor de autenticación estándar.
  - impacto: el middleware podría bloquear rutas legítimas o permitir acceso indebido si la integración falla.
  - mitigación: mantener la ruta protegida como criterio de aceptación y validar sesión con pruebas de regresión antes de avanzar.

- Medio
  - causa: Prisma y Supabase Postgres requieren una configuración estricta de variables de entorno y de cliente.
  - impacto: el sistema podría fallar al arrancar si el datasource o las claves de acceso están mal definidos.
  - mitigación: separar claramente las variables de cliente de lectura, escritura y administración y documentar explícitamente cada una.

- Medio
  - causa: el seed inicial puede depender de registros base aún no creados.
  - impacto: el primer arranque de la app podría quedar incompleto si el orden de carga no está bien definido.
  - mitigación: diseñar un orden explícito de seeding y validar el estado mínimo del sistema antes de pasar al siguiente sprint.

## Criterios de aceptación

- La aplicación puede arrancar con variables de entorno de Supabase y Prisma apuntando a Postgres.
- El login administrativo y la protección de rutas siguen funcionando desde Next.js.
- La configuración del negocio puede guardarse y recuperarse desde la base remota.
- La ruta /api/health responde correctamente en el nuevo entorno.
- La separación entre service role y cliente autenticado queda documentada y validada para evitar bypass de RLS.
- La documentación de configuración queda lista para que un desarrollador pueda repetir la instalación sin decisiones adicionales.

## Checklist final del Sprint

- [ ] Infraestructura de datos operativa sobre Supabase
- [ ] Sesión administrativa funcional
- [ ] Configuración del negocio persistida en la nueva base
- [ ] Auditoría básica funcionando
- [ ] Rutas protegidas y salud del sistema verificadas
