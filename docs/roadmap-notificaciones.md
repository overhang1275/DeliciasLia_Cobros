# Roadmap maestro: Notificaciones y recordatorios

Este documento reemplaza:

- `docs/roadmap-notificaciones-estado-cuenta.md`
- `docs/roadmap-evolution-api-whatsapp.md`

## Objetivo

Centralizar todos los avisos del sistema en una estrategia simple y segura:

- El cliente puede activar notificaciones push desde su estado de cuenta publico.
- El admin puede compartir estados de cuenta y enviar recordatorios por WhatsApp.
- Evolution API se puede activar o desactivar desde configuracion.
- Si Evolution API falla, el sistema conserva el flujo actual con `wa.me`.
- Todo envio importante queda registrado en auditoria.

## Principios

- No romper ventas, creditos, pagos, pedidos ni cambios pendientes.
- No exponer secretos en frontend.
- No permitir que el estado de cuenta publico dispare mensajes a otros clientes.
- No automatizar mensajes masivos hasta probar primero el envio manual.
- Mantener un solo lugar de configuracion y un solo helper de envio por canal.

## Estado actual

La app ya cuenta con:

- Estado de cuenta publico por token: `/estado/[token]`.
- Estado de cuenta admin desde clientes.
- Boton de compartir por WhatsApp usando `wa.me`.
- Notificaciones push con `web-push`.
- Modelo `PushSubscription`.
- APIs de push para suscribir, desuscribir, llave publica y envio.
- Script `push:weekly` para recordatorios.
- APIs N8N para deudores y corte del dia.
- Auditoria basica en logs.

## Canales

### 1. Push web

Uso principal:

- Recordar al cliente que tiene saldo pendiente.
- Abrir su estado de cuenta al tocar la notificacion.

Reglas:

- Solo el cliente puede activar o desactivar su suscripcion.
- La suscripcion se liga a `clienteId`.
- El boton se muestra en `/estado/[token]` solo cuando no hay sesion admin.
- El admin puede enviar recordatorio manual solo desde vista admin.
- Si el cliente no tiene suscripcion activa, el boton admin debe indicar que no se puede enviar.

### 2. WhatsApp manual con `wa.me`

Uso principal:

- Respaldo universal.
- Compartir estado de cuenta aunque Evolution API no este configurado.

Reglas:

- Siempre debe quedar disponible para admin cuando el cliente tiene telefono.
- Debe incluir saltos de linea en el mensaje.
- Debe incluir link publico por token.
- Debe incluir saldo pendiente cuando aplique.

### 3. WhatsApp automatico con Evolution API

Uso principal:

- Enviar estado de cuenta directo desde la app.
- Enviar recordatorio manual desde estado de cuenta admin.
- Mas adelante, enviar recordatorios automaticos controlados.

Reglas:

- Solo admin puede disparar envios.
- La API key nunca usa `NEXT_PUBLIC_`.
- Si Evolution API esta apagado o falla, usar `wa.me` como fallback.
- Registrar cada intento en auditoria.
- No enviar a clientes sin telefono.
- No enviar recordatorio si saldo pendiente es 0.

## Configuracion

Agregar o conservar un acordeon llamado `Notificaciones` en `/configuracion`.

Bloques internos recomendados:

### Push web

- Activar recordatorios push.
- VAPID public key visible solo como estado de configuracion.
- VAPID subject.
- Boton de prueba si hay cliente/suscripcion disponible.

### WhatsApp / Evolution API

- Activar WhatsApp automatico.
- Evolution API URL.
- API key.
- Instancia.
- Numero remitente.
- Modo prueba.
- Numero de prueba.
- Plantilla de estado de cuenta.
- Plantilla de recordatorio.

La API key debe mostrarse enmascarada despues de guardar, por ejemplo `******abcd`.

## Modelo de datos

Mantener `PushSubscription`:

- `endpoint`
- `p256dh`
- `auth`
- `clienteId`
- `createdAt`
- `updatedAt`

Agregar a `Configuracion` solo si se implementa Evolution API:

- `whatsappActivo Boolean @default(false)`
- `evolutionApiUrl String?`
- `evolutionApiKey String?`
- `evolutionInstance String?`
- `whatsappRemitente String?`
- `whatsappModoPrueba Boolean @default(true)`
- `whatsappNumeroPrueba String?`
- `plantillaEstadoCuenta String?`
- `plantillaRecordatorio String?`
- `recordatoriosAutomaticosActivos Boolean @default(false)`
- `recordatoriosFrecuencia String @default("manual")`
- `recordatoriosHora String @default("10:00")`

No crear tablas nuevas de historial al inicio. Usar `AuditLog`. Si despues se necesitan metricas mas finas, agregar una tabla `NotificationLog`.

## Servicios internos

### Push

Mantener `lib/push.ts` como unico punto de envio push.

Debe cubrir:

- Validar VAPID keys.
- Calcular saldo pendiente.
- Incluir monto pendiente en el mensaje.
- Incluir URL publica correcta usando `TUNNEL_URL` / `NEXT_PUBLIC_BASE_URL`.
- Eliminar suscripciones expiradas cuando el proveedor devuelva error permanente.

### WhatsApp

Crear `lib/whatsapp.ts` cuando se implemente Evolution API.

Funciones minimas:

- `normalizarTelefono(telefono: string): string | null`
- `whatsappDisponible(): Promise<boolean>`
- `mensajeEstadoCuenta({ cliente, saldo, url })`
- `mensajeRecordatorio({ cliente, saldo, url })`
- `enviarWhatsApp({ telefono, mensaje, tipo, clienteId })`

No crear clases ni factories. Un helper simple basta.

## Seguridad

- Las rutas publicas de estado de cuenta solo leen por token.
- Las rutas de envio manual requieren sesion admin.
- Evolution API key vive solo en servidor/base de datos.
- No exponer endpoint de envio para cliente publico.
- N8N conserva `N8N_API_KEY`.
- Los recordatorios automaticos deben evitar duplicados por cliente en el mismo dia.
- Todo error de envio se registra sin mostrar secretos.

## Auditoria

Registrar:

- Fecha y hora.
- Cliente.
- Telefono o endpoint.
- Canal: `push`, `whatsapp_wa_me`, `whatsapp_evolution`.
- Tipo: `estado_cuenta`, `recordatorio`, `prueba`, `automatico`.
- Resultado: `enviado`, `fallido`, `omitido`.
- Saldo pendiente usado.
- Error si fallo.
- Usuario admin cuando aplique.

Ejemplos:

```text
Push enviado | Cliente: Ana Lopez | Tipo: recordatorio | Saldo: $120.00
WhatsApp enviado | Cliente: Ana Lopez | Telefono: 528112345678 | Tipo: estado_cuenta | Saldo: $120.00
WhatsApp fallido | Cliente: Ana Lopez | Error: instancia desconectada
Recordatorio omitido | Cliente: Ana Lopez | Motivo: saldo 0
```

## Mensajes base

### Estado de cuenta

```text
Hola {cliente}.

Te comparto tu estado de cuenta:
{url}

Saldo pendiente: {saldo}

Cualquier duda, favor de mandar mensaje.
```

### Recordatorio

```text
Hola {cliente}.

Te recordamos que tienes un saldo pendiente de {saldo}.
Puedes revisar tu estado de cuenta aqui:
{url}

Gracias.
```

### Push

```text
Tienes un saldo pendiente de {saldo}. Puedes ver tu estado de cuenta aqui.
```

## Fases

### Fase 1 - Consolidar push actual

- [ ] Revisar que `PushSubscription` tenga migracion aplicada.
- [ ] Verificar VAPID keys en instalacion, update y demo.
- [ ] Verificar que `PushSubscriptionButton` funcione en movil y desktop.
- [ ] Confirmar que el boton no se muestre al admin.
- [ ] Confirmar que el recordatorio push incluye monto pendiente.
- [ ] Confirmar que la notificacion abre la URL publica correcta.

### Fase 2 - Mejorar confiabilidad de push

- [ ] Limpiar suscripciones expiradas al fallar envio permanente.
- [ ] Mostrar estado claro: sin permiso, bloqueado, activo, desactivado.
- [ ] Agregar auditoria para envio push manual.
- [ ] Agregar auditoria para envio push automatico.
- [ ] Documentar que push requiere HTTPS o localhost.

### Fase 3 - Configuracion de Evolution API

- [ ] Agregar campos de WhatsApp a `Configuracion`.
- [ ] Crear migracion Prisma.
- [ ] Agregar acordeon `WhatsApp / Evolution API` en `/configuracion`.
- [ ] Guardar URL, instancia, key, modo prueba y switch activo.
- [ ] Enmascarar API key despues de guardar.
- [ ] Agregar boton `Enviar prueba`.

### Fase 4 - Helper WhatsApp

- [ ] Crear `lib/whatsapp.ts`.
- [ ] Normalizar telefonos de Mexico.
- [ ] Validar configuracion antes de enviar.
- [ ] Implementar llamada a Evolution API.
- [ ] Manejar errores sin romper la app.
- [ ] Registrar auditoria de exito y fallo.

### Fase 5 - Estado de cuenta admin

- [ ] Usar Evolution API para `Enviar por WhatsApp` si esta activo.
- [ ] Mantener fallback `wa.me`.
- [ ] Incluir saldo, cliente y link publico.
- [ ] Mostrar toast de exito/error.
- [ ] Evitar doble envio por doble click.

### Fase 6 - Recordatorio manual

- [ ] Boton `Enviar recordatorio` visible solo para admin.
- [ ] Mostrarlo solo si hay saldo pendiente.
- [ ] Para WhatsApp, mostrarlo solo si hay telefono.
- [ ] Para push, mostrarlo solo si hay suscripcion activa.
- [ ] Confirmar antes de enviar.
- [ ] Registrar auditoria.

### Fase 7 - Recordatorios automaticos

- [ ] Activar/desactivar desde configuracion.
- [ ] Frecuencia: manual, semanal o quincenal.
- [ ] Hora configurable.
- [ ] No enviar si saldo es 0.
- [ ] No enviar si falta telefono/suscripcion segun canal.
- [ ] No enviar mas de 1 recordatorio por cliente por dia.
- [ ] Crear script o cron.
- [ ] Registrar resumen del proceso.

### Fase 8 - Metricas y mantenimiento

- [ ] Mostrar ultimos envios en log/auditoria.
- [ ] Descargar log completo.
- [ ] Contar enviados, fallidos y omitidos.
- [ ] Documentar troubleshooting: permisos de navegador, HTTPS, VAPID, Evolution desconectado.

## Endpoint esperado de Evolution API

Confirmar endpoint exacto con la version instalada antes de implementar. La forma comun es:

```http
POST {EVOLUTION_API_URL}/message/sendText/{INSTANCE}
apikey: {API_KEY}
Content-Type: application/json
```

Body aproximado:

```json
{
  "number": "528112345678",
  "text": "Mensaje"
}
```

## Criterios de terminado

- El cliente puede activar y desactivar push desde su estado de cuenta.
- El admin no ve controles de cliente en estado publico.
- El admin puede enviar recordatorio push manual si existe suscripcion.
- El monto pendiente aparece en la notificacion.
- La URL abre el estado de cuenta correcto usando dominio/tunnel configurado.
- Evolution API se puede activar/desactivar desde configuracion.
- Se puede enviar mensaje de prueba por WhatsApp.
- Se puede enviar estado de cuenta por WhatsApp desde admin.
- Se puede enviar recordatorio manual por WhatsApp desde admin.
- Si Evolution API falla, `wa.me` sigue disponible.
- Todo envio queda registrado en auditoria.
- Los recordatorios automaticos no envian duplicados diarios.

## No implementar todavia

- Campanas masivas.
- Multiples instancias de Evolution API.
- Plantillas avanzadas por cliente.
- Adjuntos automaticos complejos.
- Panel de marketing.
- Supabase Realtime para notificaciones.

## Orden recomendado

1. Cerrar push web actual y dejarlo confiable.
2. Agregar configuracion de Evolution API.
3. Implementar helper WhatsApp.
4. Conectar estado de cuenta admin.
5. Agregar recordatorio manual.
6. Solo despues activar recordatorios automaticos.

