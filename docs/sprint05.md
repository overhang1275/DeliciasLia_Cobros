# Sprint 05 - Cutover, estabilización y liberación controlada

## Resumen ejecutivo

Este sprint no introduce nuevas capacidades de negocio, sino que garantiza que la migración se convierta en una liberación operativa segura. Su propósito es cerrar la brecha entre el entorno de desarrollo y el entorno productivo: validar que la aplicación funcione con la nueva infraestructura, controlar el cutover desde el sistema actual al nuevo modelo y minimizar el riesgo de regresión. Al cerrarlo, el negocio cuenta con una ruta de despliegue controlada, una estrategia de rollback definida y una base de monitoreo para la operación diaria.

## Objetivo

Realizar el paso de transición desde el modelo de datos actual hacia el nuevo entorno operativo con Supabase Postgres, sin perder continuidad para los usuarios administrativos ni comprometer la integridad del negocio. El sprint debe asegurar que la app pueda operar en producción con la nueva base, que las operaciones críticas hayan sido validadas y que cualquier problema detectado pueda corregirse sin impacto prolongado.

## Alcance

### Módulos afectados

- despliegue y puesta en marcha
- validación funcional integral
- rollback y contingencia
- observabilidad operativa
- documentación de operación

### Módulos no afectados

- nuevas funcionalidades de negocio
- cambios de experiencia de usuario no relacionados con la migración
- rediseño de procesos internos

## Dependencias

### Requiere

- Sprint 01 completado
- Sprint 02 completado
- Sprint 03 completado
- Sprint 04 completado

### Desbloquea

- operación estable en producción
- seguimiento continuo de la migración
- futuras mejoras no incluidas en este plan

## Entregables

### Frontend (Next.js)

- [ ] Validar el flujo completo desde login hasta reportes y estado público con la nueva base.
- [ ] Confirmar que las pantallas de clientes, productos, ventas, fiados, pedidos y reportes operan sin regresiones funcionales.
- [ ] Ejecutar una suite mínima de smoke tests automatizados con Playwright para cubrir: login, venta rápida, fiado, pago y reporte.
- [ ] Verificar que los mensajes de error y los estados de carga sean comprensibles para el usuario final.

### Backend / Supabase

- [ ] Validar que las operaciones transaccionales críticas funcionen correctamente en el entorno de producción.
- [ ] Confirmar que las políticas RLS protegen los datos de acuerdo con el diseño de seguridad.
- [ ] Asegurar que la base remota pueda sostener el volumen operativo esperado para el negocio.

### Infraestructura

- [ ] Definir el proceso de despliegue controlado para el cutover.
- [ ] Preparar la estrategia de rollback y la lista de verificación de salida de emergencia.
- [ ] Asegurar que las variables de entorno y secretos definitivos estén documentados y protegidos.

### Seguridad

- [ ] Revisar permisos administrativos, roles y alcance de acceso en la nueva base.
- [ ] Validar que la ruta pública de estado de cuenta siga siendo la única superficie pública del sistema.
- [ ] Confirmar que no exista exposición indebida de datos financieros o de auditoría.

### Migración de datos

- [ ] Ejecutar la migración final de datos críticos y validar la consistencia del estado de negocio.
- [ ] Implementar un script automatizado en Node/TS que calcule checksums MD5 agregados de los datos de origen (SQLite) y destino (Postgres) para métricas clave como ventas totales, conteo de clientes y deuda acumulada.
- [ ] Bloquear el cutover en staging y producción si los checksums no coinciden, sin permitir avanzar a la liberación hasta corregir las diferencias.
- [ ] Activar un modo de solo lectura en el sistema antiguo 60 minutos antes del corte para detener nuevas ventas y evitar divergencia de estado en datos altamente volátiles.
- [ ] Registrar los IDs o marcas de tiempo de las últimas ventas del día en SQLite y preparar un catch-up manual o semiautomático hacia Postgres para cubrir el periodo de transición.
- [ ] Dejar un registro de los datos migrados y del punto de corte para auditoría interna.

### Observabilidad

- [ ] Definir los 3 monitores de latido para los primeros 30 minutos de operación: tasa de éxito del login, tiempo de respuesta del historial de cliente y conteo de ventas por minuto.
- [ ] Integrar Sentry o Logtail para trazabilidad de errores en cadena y alertas operativas en lugar de depender solo de logs crudos.
- [ ] Garantizar que los errores de autenticación, base de datos y transacciones queden visibles para soporte.
- [ ] Documentar los pasos para diagnosticar incidentes en la nueva arquitectura.

### Documentación

- [ ] Preparar la guía de operación del sistema sobre Supabase.
- [ ] Documentar el proceso de rollback y las condiciones de contingencia.
- [ ] Actualizar el manual de despliegue y la documentación de soporte técnico.

## Librerías nuevas

- nombre: Ninguna adicional
  propósito: este sprint se enfoca en operación y validación, no en introducir nuevas abstracciones.
  motivo: la migración ya está cubierta por la arquitectura escogida en los sprints previos.
  alternativas consideradas: incorporar herramientas de observabilidad adicionales; se rechaza porque el alcance debe mantenerse orientado a la estabilización del sistema.
  impacto: bajo.
  comando: npm install

## Archivos probablemente afectados

- README.md
- docs/ROADMAP.md
- docs/sprint*.md
- scripts de despliegue y operación
- variables de entorno y documentación operativa

## Riesgos

- Alto
  - causa: el cutover puede introducir una diferencia de estado entre el sistema anterior y el nuevo entorno.
  - impacto: se pueden presentar inconsistencias visibles en ventas, pagos o reportes tras el cambio.
  - mitigación: ejecutar validación por lotes y preparar un rollback claro antes de la liberación.

- Medio
  - causa: la observabilidad limitada podría retrasar la detección de fallas en producción.
  - impacto: los incidentes tardarían más en resolverse y aumentarían el riesgo operativo.
  - mitigación: definir métricas, logs y pasos de diagnóstico desde el inicio del sprint.

## Criterios de aceptación

- El sistema opera con Supabase Postgres en el entorno objetivo sin regresiones funcionales críticas.
- La migración puede revertirse siguiendo la estrategia de rollback sin pérdida de datos críticos.
- La operación queda documentada para soporte y mantenimiento.
- La validación automatizada por checksums queda ejecutada y bloquea el cutover si hay diferencias de integridad.
- El modo de solo lectura previo al corte y el catch-up de ventas del día quedan definidos y ejecutables.
- Los smoke tests automatizados con Playwright validan los caminos críticos tras el cutover.
- Los indicadores básicos de negocio y de salud del sistema pueden verificarse tras el cutover.

## Checklist final del Sprint

- [ ] Cutover ejecutado con control y trazabilidad
- [ ] Validación funcional integral completada
- [ ] Rollback documentado y probado conceptualmente
- [ ] Observabilidad operativa mínima activa
- [ ] Equipo de soporte capaz de operar el sistema en la nueva arquitectura
