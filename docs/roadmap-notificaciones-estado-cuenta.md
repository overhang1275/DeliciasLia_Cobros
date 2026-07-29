# Roadmap: Notificaciones Push en Estado de Cuenta

## Idea central
Cada cliente accede a su estado de cuenta vía `/estado/[token]` y puede **activar notificaciones push** para recibir un recordatorio cuando tenga saldo pendiente por pagar. No hay suscripción global; cada cliente gestiona su propia suscripción desde su página.

---

## Fase 1 — Base técnica

- [ ] Instalar `web-push` y generar VAPID keys
- [ ] Agregar modelo `PushSubscription` en Prisma (vinculado a `clienteId` nullable)
- [ ] Migrar base de datos
- [ ] Configurar variables de entorno (claves VAPID, subject)

## Fase 2 — API & Service Worker

- [ ] Crear API route `POST /api/push/subscribe` (guarda endpoint + keys + clienteId)
- [ ] Crear API route `POST /api/push/unsubscribe` (elimina por endpoint)
- [ ] Agregar `/public/sw.js` con listeners de `push` y `notificationclick`
- [ ] Registrar el service worker desde el layout o componente cliente

## Fase 3 — UI de suscripción en Estado de Cuenta

- [ ] Crear componente `PushSubscriptionButton` ("Activar notificaciones" / "Desactivar")
- [ ] Integrarlo en `/estado/[token]/page.tsx` (visible solo para el cliente, no admin)
- [ ] Hook `usePushNotifications` para manejar el ciclo de vida del SW y suscripción

## Fase 4 — Lógica de recordatorios

- [ ] En la página `/estado/[token]`, después de cargar los datos:
  - Si el cliente tiene saldo pendiente > $0, mostrar un banner o botón "Enviar recordatorio" que dispare una notificación push
  - El cliente decide cuándo notificarse (no es automático sin consentimiento)
- [ ] Cron semanal **cada viernes a las 10:00 AM** que recorra clientes con suscripción activa **y saldo > 0** y envíe un recordatorio tipo: "Tiene un saldo pendiente en {negocio}. Puede ver su estado de cuenta aquí."

## Fase 5 — Refinamiento

- [ ] Programación del cron (Vercel Cron, cron-job.org, o script local)
- [ ] Manejo de errores y limpieza de suscripciones expiradas
- [ ] Pruebas: verificar que al expirar una suscripción se elimine automáticamente
- [ ] Métricas: cuántas notificaciones se enviaron, cuántas fallaron

---

## Respeto al diseño actual

- No se modifica el flujo de ventas, fiados ni pagos
- No se agregan pantallas nuevas
- Solo se añade un botón en el estado de cuenta público
- La suscripción está atada al `clienteId`, no al usuario admin

## Dependencias externas

- `web-push` (única nueva dependencia)
- Servicio de cron (Vercel Cron, cron-job.org, o tarea programada en el servidor)
