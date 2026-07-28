# Sprint 03 - Núcleo transaccional: ventas, fiados y control de inventario

## Resumen ejecutivo

Este sprint habilita el corazón operativo del negocio sobre Supabase: ventas, fiados, pagos parciales, liquidación de deudas, cambio pendiente y movimientos de inventario. Es el sprint de mayor impacto funcional porque conecta datos maestros con operaciones financieras reales. Su valor es doble: conserva la lógica del negocio actual y elimina la dependencia de SQLite para las operaciones que más probablemente generan errores si se migran sin disciplina. Al cerrarlo, la aplicación ya no solo podrá listar y editar datos, sino ejecutar las operaciones que sostienen la operación diaria con un conjunto operativo mínimo, sin depender de una migración histórica completa para validar el flujo.

## Objetivo

Implementar la capa transaccional sobre Supabase Postgres para que las ventas pagadas y fiadas, los pagos, la liquidación de deudas, el cambio pendiente y el inventario funcionen con la misma lógica de negocio que usa la versión actual. La prioridad es conservar la integridad de las operaciones que escriben en varias tablas en una sola acción, con un conjunto de datos suficiente para validar el funcionamiento del negocio desde el primer release.

## Alcance

### Módulos afectados

- ventas rápidas
- fiados y pagos
- liquidación de deudas
- cambio pendiente
- dashboard inicial con indicadores operativos
- movimientos de inventario

### Módulos no afectados

- reportes agregados
- pedidos
- auditoría administrativa extensiva
- procesos de despliegue

## Dependencias

### Requiere

- Sprint 01 completado
- Sprint 02 completado con clientes, productos y configuración operativos

### Desbloquea

- Sprint 04: pedidos y reportes
- Sprint 05: cutover y estabilización

## Entregables

### Frontend (Next.js)

- [ ] Ajustar la página de ventas para crear ventas pagadas o fiadas con los datos remotos y mantener la lógica de cambio pendiente.
- [ ] Ajustar la página de fiados para cargar ventas pendientes, registrar pagos, liquidar deudas y eliminar créditos con el mismo flujo de confirmación.
- [ ] Mantener el dashboard principal con los indicadores de crédito por cobrar, cambios pendientes y resumen diario sobre la nueva fuente de datos.
- [ ] Asegurar que los componentes de pago, liquidación y entrega de cambio se refresquen tras cada operación y reflejen el estado actualizado.

### Backend / Supabase

- [ ] Definir y validar las tablas y relaciones para Venta, DetalleVenta, Pago y MovimientoInventario en Postgres.
- [ ] Re-implementar la lógica de negocio que calcula subtotal, total, costo total, utilidad total, cambio pendiente y estados de venta según pagos recibidos.
- [ ] Mantener la integridad transaccional de operaciones con múltiples escrituras, como venta + detalle + pago inicial o eliminación de crédito con sus pagos y detalles asociados.
- [ ] Garantizar que el inventario se actualice de forma consistente en el mismo flujo que la venta.

### Infraestructura

- [ ] Ajustar lib/ventas.ts para trabajar contra la base remota sin depender de semantics específicas de SQLite.
- [ ] Validar que los enums de EstadoVenta, MetodoPago y EstadoPedido se traduzcan correctamente a la nueva base y no generen errores de serialización.
- [ ] Definir un patrón de manejo de errores para transacciones fallidas y operaciones incompletas.

### Seguridad

- [ ] Restringir la escritura de ventas, pagos y liquidaciones a usuarios administrativos autenticados.
- [ ] Mantener la lectura de clientes y productos para las pantallas transaccionales sin exponer información ajena al flujo operativo.
- [ ] Evitar que operaciones financieras puedan ejecutarse con permisos insuficientes o por rutas no autorizadas.

### Migración de datos

- [ ] Cargar un conjunto operativo mínimo de ventas, pagos y movimientos de inventario para validar el flujo transaccional sobre Supabase.
- [ ] Recalcular saldos pendientes y cambios pendientes a partir de los registros operativos disponibles para que el tablero y los flujos reflejen el estado correcto.
- [ ] Preservar los movimientos de inventario asociados a ventas y ajustes previos, sin asumir que el historial completo debe migrarse en este sprint.

### Observabilidad

- [ ] Registrar eventos de creación de venta, pago y liquidación para auditar el flujo operativo.
- [ ] Capturar fallos en transacciones y exponer el estado de la operación en logs estructurados.

### Documentación

- [ ] Actualizar la documentación del flujo financiero para reflejar la nueva fuente de persistencia y el comportamiento esperado de estados y pagos.

## Librerías nuevas

- nombre: Ninguna adicional
  propósito: la lógica transaccional puede cubrirse con la pila ya instalada en los sprints previos.
  motivo: no se requiere una librería nueva para garantizar transacciones, validaciones ni cálculos de negocio.
  alternativas consideradas: introducir un adaptador de pagos o un framework de eventos; se rechaza porque excede el alcance de la migración.
  impacto: bajo.
  comando: npm install

## Archivos probablemente afectados

- app/page.tsx
- app/ventas/page.tsx
- app/ventas/actions.ts
- app/ventas/CambioPendienteFields.tsx
- app/ventas/DarCambioButton.tsx
- app/fiados/page.tsx
- app/fiados/actions.ts
- app/fiados/[id]/pago/page.tsx
- lib/ventas.ts
- lib/validators/ventas.ts
- lib/validators/fiados.ts
- lib/audit.ts
- prisma/schema.prisma
- components/LiquidarDeudaForm.tsx
- components/EliminarFiadoForm.tsx

## Riesgos

- Alto
  - causa: la lógica de estados de venta y pagos es altamente sensible a errores de redondeo y a inconsistencias entre montos pagados y totales.
  - impacto: las pantallas de negocio podrían mostrar saldos incorrectos o estados inconsistentes.
  - mitigación: validar todas las operaciones con datos de referencia y comparar resultados con el comportamiento actual antes de avanzar.

- Medio
  - causa: las operaciones de transacción múltiple pueden fallar si el orden de escritura no está bien definido.
  - impacto: podría quedar una venta sin detalle o un pago sin registrar su efecto de estado.
  - mitigación: separar la lógica en pasos claros de validación y escritura, y hacer rollback explícito en caso de error.

## Criterios de aceptación

- Se pueden registrar ventas pagadas y fiadas desde la UI y persistirlas en Supabase.
- Los pagos parciales y la liquidación de deudas actualizan correctamente el estado de la venta y el saldo pendiente.
- El cambio pendiente se contabiliza y se marca como entregado sin corrupción de datos.
- El inventario del producto se ajusta de forma consistente con cada venta registrada.
- El flujo transaccional queda validado sin depender de la migración histórica completa del negocio.

## Checklist final del Sprint

- [ ] Ventas y fiados funcionales sobre la nueva base
- [ ] Pagos y liquidaciones consistentes
- [ ] Cambio pendiente y estados correctos
- [ ] Inventario actualizado por cada venta
- [ ] Errores transaccionales registrados y manejados
