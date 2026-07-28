# Sprint 04 - Operaciones analíticas y de seguimiento

## Resumen ejecutivo

Este sprint cierra el ciclo de operación funcional de los módulos de análisis y seguimiento sobre Supabase. Después de que ventas y fiados queden respaldados por la nueva infraestructura, el siguiente paso lógico es garantizar que los pedidos, los reportes, el historial del cliente y el registro de auditoría funcionen de manera consistente con las mismas reglas de negocio. El valor de este sprint es evitar que la puesta en marcha deje una brecha analítica: el negocio debe poder seguir tomando decisiones con los mismos indicadores, aunque la base ya no sea SQLite y aunque la carga histórica completa se deje para una fase posterior.

## Objetivo

Asegurar que los módulos dependientes de la información transaccional —pedidos, reportes, historial de cliente y auditoría— funcionen sobre la nueva base con la misma semántica y precisión que hoy, utilizando al menos un conjunto operativo de datos suficiente para validar el funcionamiento del negocio desde el primer release. El sprint debe proteger la integridad de los indicadores de negocio y la trazabilidad administrativa.

## Alcance

### Módulos afectados

- pedidos pendientes y cancelados
- reportes de ventas, cobros, crédito y productos
- historial de cliente consolidado
- auditoría administrativa
- navegación y filtros de consulta

### Módulos no afectados

- creación de nuevas funcionalidades de negocio
- cambios en el diseño visual del sistema
- incorporación de nuevos canales de pago

## Dependencias

### Requiere

- Sprint 01 completado
- Sprint 02 completado
- Sprint 03 completado

### Desbloquea

- Sprint 05: cutover y estabilización

## Entregables

### Frontend (Next.js)

- [ ] Ajustar la página de pedidos para listar, filtrar, crear y cancelar pedidos desde la nueva base.
- [ ] Ajustar la página de reportes para calcular ventas, cobros, crédito por cobrar, top clientes, top productos y pedidos pendientes con datos reales de Supabase.
- [ ] Ajustar la página de historial de cliente para consolidar ventas, pagos, pedidos y cambios pendientes en una vista única coherente.
- [ ] Mantener la ruta de configuración con la vista de auditoría y asegurar que los registros mostrados correspondan a acciones reales ejecutadas.

### Backend / Supabase

- [ ] Mapear las tablas y relaciones para Pedido y AuditLog con el mismo nivel de detalle que hoy usa Prisma.
- [ ] Asegurar que los reportes por rango de fechas, top clientes y top productos calculen correctamente sobre Postgres con joins y agregaciones apropiadas.
- [ ] Definir la estrategia de escritura de auditoría para que cada acción relevante quede registrada con entidad, entidadId, detalle y usuario responsable.

### Infraestructura

- [ ] Ajustar los helpers de fecha y formato de reportes para que no dependan de comportamientos específicos de SQLite o de la base local.
- [ ] Confirmar que el seed demo y el seed estándar no generen inconsistencias con los datos migrados.
- [ ] Preparar el entorno de verificación para pruebas de regresión del flujo completo de negocio.

### Seguridad

- [ ] Mantener RLS estrictas para tablas de auditoría y pedidos.
- [ ] Limitar la escritura de pedidos y auditoría a usuarios administradores autenticados.
- [ ] Mantener la ruta pública de estado de cuenta como la única vista externa de información financiera del cliente.

### Migración de datos

- [ ] Cargar pedidos pendientes y cancelados mínimos para validar el funcionamiento del flujo sobre Supabase, preservando fecha de pedido, fecha de entrega, estado y relación con cliente y producto.
- [ ] Asegurar una base limpia y coherente de auditoría para la nueva instalación, sin asumir que todo el historial debe cargarse en este sprint.
- [ ] Validar que reportes e historial de cliente sean consistentes con ventas, pagos y pedidos ya operando sobre la nueva base.

### Observabilidad

- [ ] Registrar operaciones de pedido, cancelación y auditoría con metadatos útiles para diagnóstico.
- [ ] Definir métricas mínimas para volumen de ventas, crédito pendiente y pedidos activos.

### Documentación

- [ ] Actualizar la documentación operativa de reportes, historial y auditoría para reflejar la nueva fuente de consulta.

## Librerías nuevas

- nombre: Ninguna adicional
  propósito: este sprint puede completarse con la infraestructura ya instalada.
  motivo: los reportes, historial y auditoría se pueden resolver con el stack ya adoptado y con los datos ya migrados.
  alternativas consideradas: incorporar un motor de agregación especializado; se rechaza porque excede el alcance y no aporta valor frente a la complejidad añadida.
  impacto: bajo.
  comando: npm install

## Archivos probablemente afectados

- app/pedidos/page.tsx
- app/pedidos/actions.ts
- app/reportes/page.tsx
- app/clientes/[id]/historial/page.tsx
- app/estado/[token]/page.tsx
- lib/audit.ts
- lib/timezone.ts
- components/Pagination.tsx
- components/ConfirmSubmitButton.tsx
- prisma/seed.ts
- prisma/demo-seed.ts

## Riesgos

- Alto
  - causa: los reportes agregados son sensibles a joins múltiples y cambios de filtro por fecha.
  - impacto: las métricas del negocio podrían desviarse de la realidad si la lógica no se replica con precisión.
  - mitigación: comparar los resultados del nuevo entorno con los datos conocidos y con los cálculos actuales antes de liberar.

- Medio
  - causa: la auditoría puede crecer demasiado y degradar la experiencia si no se define un límite o un patrón de consulta eficiente.
  - impacto: la ruta de configuración podría volverse lenta o poco útil.
  - mitigación: definir índices y límites de consulta desde el inicio.

## Criterios de aceptación

- Los pedidos, reportes, historial de cliente y auditoría funcionan sobre Supabase Postgres con los mismos flujos de negocio del sistema actual.
- Los reportes muestran totales y rankings consistentes con las transacciones migradas.
- La auditoría registra las acciones administrativas relevantes y se consulta desde la UI sin errores.
- El sistema queda listo para una fase de validación funcional y de desempeño antes de la liberación.

## Checklist final del Sprint

- [ ] Pedidos operativos sobre la nueva base
- [ ] Reportes y métricas consistentes
- [ ] Historial de cliente completo y verificable
- [ ] Auditoría funcional y trazable
- [ ] Preparación para cutover completa
