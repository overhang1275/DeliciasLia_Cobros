# Sprint 02 - Catálogo maestro y estado de cuenta público

## Resumen ejecutivo

Este sprint concentra la habilitación de los datos maestros y del canal de consulta pública del negocio para que la aplicación pueda operar sobre Supabase desde el primer release. El objetivo no es cargar todo el historial ni convertir la migración en una gran carga masiva, sino preservar las reglas actuales del negocio: los clientes y productos se desactivan en lugar de eliminarse, el cliente general sigue existiendo como registro base y el estado de cuenta público sigue funcionando con un token único. Este es el primer sprint funcional del roadmap porque deja el sistema listo para soportar flujos operativos más complejos como ventas y fiados, sin depender de datos locales.

## Objetivo

Habilitar las entidades maestras del sistema sobre la nueva base de datos y asegurar que las pantallas administrativas y públicas que consumen esas entidades funcionen con los mismos filtros, cálculos y permisos que hoy tienen. En este sprint se debe validar el comportamiento de búsqueda, listado, edición y generación del estado de cuenta público con un conjunto mínimo de datos operativo, dejando la importación histórica completa para una fase posterior.

## Alcance

### Módulos afectados

- clientes
- productos
- configuración visible del negocio
- estado de cuenta público
- historial del cliente
- búsqueda y paginación en pantallas administrativas

### Módulos no afectados

- transacciones financieras complejas
- pagos parciales
- movimientos de inventario
- reportes agregados

## Dependencias

### Requiere

- Sprint 01 completado con infraestructura de datos y sesión operativa

### Desbloquea

- Sprint 03: ventas y fiados
- Sprint 04: pedidos y reportes
- Sprint 05: cutover y estabilización

## Entregables

### Frontend (Next.js)

- [ ] Ajustar la página de clientes para listar, buscar, editar y desactivar registros desde la nueva base.
- [ ] Ajustar la página de productos para crear, listar y filtrar registros con los datos remotos.
- [ ] Mantener la ruta de edición de clientes y la ruta de historial con los mismos cálculos de saldo y deuda actuales.
- [ ] Asegurar que la ruta pública /estado/[token] siga mostrando cargos, pagos y saldo con el mismo formato y orden de la implementación previa.

### Backend / Supabase

- [ ] Definir el modelo lógico equivalente para Cliente, Producto y Configuracion visible.
- [ ] Replantear las consultas de listado y búsqueda para que funcionen con índices y filtros apropiados en Postgres.
- [ ] Preservar el campo estadoToken como identificador estable para el estado público.
- [ ] Mantener la relación de clientes con ventas, pagos y pedidos para que el historial y los saldos sean consistentes.

### Infraestructura

- [ ] Verificar que la inicialización de Prisma no dependa de archivos SQLite locales para listar, filtrar o contar registros.
- [ ] Mantener el flujo actual de logoDataUrl sin introducir una nueva arquitectura de almacenamiento para este sprint.
- [ ] Validar un seed base de datos maestras que permita abrir el sistema sin datos incompletos.

### Seguridad

- [ ] Definir RLS para permitir a la administración autenticada leer y escribir clientes, productos y configuración.
- [ ] Garantizar que la ruta pública solo acceda a los campos mínimos necesarios para mostrar el estado de cuenta.
- [ ] Evitar la exposición de notas o datos sensibles de clientes a través de la ruta pública.

### Migración de datos

- [ ] Cargar un conjunto mínimo de clientes, productos y configuración visible del negocio, suficiente para dejar operativa la app y permitir el flujo de ventas.
- [ ] Incluir el cliente general con su token de estado de cuenta y su estado activo.
- [ ] Validar la preservación de identificadores y estados de desactivación para clientes y productos, sin asumir que la importación histórica completa debe cerrarse en este sprint.

### Observabilidad

- [ ] Capturar errores de lectura o escritura en clientes y productos.
- [ ] Registrar cambios de configuración visibles del negocio para seguimiento posterior.

### Documentación

- [ ] Actualizar la documentación del modelo de datos maestro y de las reglas de negocio asociadas a clientes y productos.

## Librerías nuevas

- nombre: Ninguna adicional
  propósito: este sprint puede completarse con la base instalada en el Sprint 01.
  motivo: no se requieren nuevas abstracciones para tablas maestras ni para el estado público.
  alternativas consideradas: introducir un cliente adicional para operaciones de lectura; se rechaza porque no aporta valor frente a la complejidad añadida.
  impacto: bajo.
  comando: npm install

## Archivos probablemente afectados

- app/clientes/page.tsx
- app/clientes/actions.ts
- app/clientes/[id]/editar/page.tsx
- app/clientes/[id]/estado/page.tsx
- app/clientes/[id]/historial/page.tsx
- app/productos/page.tsx
- app/productos/actions.ts
- app/configuracion/page.tsx
- app/configuracion/actions.ts
- app/configuracion/log.txt/route.ts
- app/estado/[token]/page.tsx
- lib/configuracion.ts
- lib/validators/clientes.ts
- lib/validators/productos.ts
- lib/audit.ts
- components/ClienteSearchField.tsx
- components/EliminarClienteButton.tsx
- components/EstadoMovimientosAccordion.tsx

## Riesgos

- Alto
  - causa: los cálculos de saldo y deuda del cliente dependen de joins y agregaciones entre múltiples entidades.
  - impacto: una mala traducción de la lógica podría generar saldos inconsistentes en la UI.
  - mitigación: validar los resultados de las consultas con datos de referencia antes de avanzar a los módulos transaccionales.

- Medio
  - causa: las políticas RLS pueden bloquear accidentalmente la lectura pública del estado de cuenta.
  - impacto: la ruta pública dejaría de funcionar incluso si la base ya contiene los datos.
  - mitigación: mantener un conjunto mínimo de columnas expuestas y probar explícitamente la ruta pública con un token válido.

## Criterios de aceptación

- Los clientes y productos pueden crearse, editarse, buscarse y desactivarse desde la UI con la nueva base.
- La ruta pública /estado/[token] funciona con datos operativos y muestra cargos y pagos en el orden esperado.
- La configuración visible del negocio se recupera desde la nueva base sin pérdida de datos.
- Las políticas RLS permiten el acceso esperado sin exponer datos sensibles a usuarios no autorizados.

## Checklist final del Sprint

- [ ] Datos maestros migrados y consistentes
- [ ] Estado de cuenta público operativo
- [ ] Búsqueda y paginación funcionando
- [ ] Configuración visible persistida correctamente
- [ ] Permisos de lectura y escritura validados
