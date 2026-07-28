# Roadmap técnico de migración a Supabase Postgres

## Visión general

Este roadmap transforma la aplicación actual basada en Prisma + SQLite en una arquitectura de producción soportada por Supabase Postgres, manteniendo el modelo de negocio existente y la experiencia de usuario actual. El objetivo inicial no es migrar toda la información de inmediato, sino lograr que la aplicación funcione de forma segura y operativa sobre Supabase, con autenticación, permisos, flujo transaccional y supervisión correctos. La migración masiva de datos se tratará como una segunda fase, separada de la puesta en marcha del sistema, para reducir el riesgo del release inicial y mejorar la compatibilidad operativa.

## Arquitectura objetivo

La arquitectura objetivo conserva la estructura actual de Next.js App Router y Prisma como capa de acceso principal, pero cambia la persistencia de SQLite local a Postgres administrado en Supabase. La aplicación seguirá usando Server Components y Server Actions para el acceso a datos, con un punto de entrada único para autenticación, sesión y configuración. La seguridad pasa a estar alineada con políticas RLS y con una separación clara entre accesos administrativos y acceso público de estado de cuenta. La primera etapa prioriza estabilidad operativa; la importación y sincronización desde SQLite se desplaza a un flujo posterior, idealmente como un script o un panel administrativo controlado.

### Componentes principales

- Next.js App Router como capa de presentación y orquestación de flujos.
- Prisma como capa de abstracción de datos y contrato de esquema.
- Supabase Postgres como motor persistente de negocio.
- RLS para asegurar el acceso a tablas sensibles.
- Auditoría estructurada para operaciones administrativas.
- Observabilidad mínima para soporte y diagnóstico.

### Principios de seguridad y operación

- Prisma con service role debe usarse solo para migraciones, seeds, scripts de fondo y operaciones de infraestructura; nunca para flujos de negocio cotidianos.
- Las Server Actions de negocio deben usar un cliente de Supabase autenticado con el JWT del usuario o un cliente de lectura/escritura restringido, nunca un cliente de administración que bypass RLS.
- El cutover debe incluir un gate de validación automática basada en checksums antes de autorizar la liberación en producción.
- El sistema antiguo debe entrar en modo de solo lectura 60 minutos antes del corte para evitar divergencia de estado en ventas del día.
- Debe existir un plan de catch-up de las últimas ventas o eventos del día para cerrar la brecha de transición hacia Postgres.
- La observabilidad debe cubrir, al menos, el éxito de login, el tiempo de respuesta del historial de cliente y el volumen de ventas por minuto durante las primeras horas de operación.
- Debe existir una suite mínima de smoke tests automatizados con Playwright para validar login, venta rápida, fiado, pago y reporte tras la migración.

## Cronología propuesta

1. Sprint 01: infraestructura base, autenticación y operación segura sobre Supabase
2. Sprint 02: catálogo maestro, estado de cuenta público y acceso controlado
3. Sprint 03: núcleo transaccional de ventas y fiados sobre la nueva base
4. Sprint 04: operaciones analíticas, seguimiento y auditoría operativa
5. Sprint 05: cutover, estabilización y liberación controlada con validación y monitoreo
6. Fase posterior: importación y sincronización desde SQLite como proceso independiente

## Diagrama de dependencias entre sprints

```text
Sprint 01
  ├─> Sprint 02
  ├─> Sprint 03
  ├─> Sprint 04
  └─> Sprint 05

Sprint 02 ──────> Sprint 03
Sprint 02 ──────> Sprint 04
Sprint 03 ──────> Sprint 04
Sprint 03 ──────> Sprint 05
Sprint 04 ──────> Sprint 05
```

## Estrategia de migración de datos

La migración debe tratarse en dos fases claramente separadas:

1. Fase inicial: poner la aplicación a operar sobre Supabase con seguridad y estabilidad
   - autenticación funcional
   - permisos y RLS correctos
   - flujos transaccionales operativos
   - observabilidad y cutover controlado

2. Fase posterior: importación y sincronización desde SQLite
   - carga inicial de datos maestros y transaccionales
   - sincronización controlada de registros de última hora
   - ejecución como script o panel administrativo independiente
   - validación explícita antes de aceptar datos en producción

La migración no debe verse como un evento único de carga masiva. Para los datos que cambian constantemente, la importación debe ser un proceso separado y controlado.

En la práctica, la estrategia debe contemplar dos capas:

1. Carga inicial de base y configuración
   - usuario administrador
   - configuración del negocio
   - auditoría inicial
   - datos maestros mínimos para abrir el sistema

2. Importación controlada de datos transaccionales
   - clientes
   - productos
   - ventas
   - pagos
   - fiados
   - inventario
   - pedidos

3. Validación y soporte posterior
   - reportes derivados
   - historial de cliente
   - auditoría operativa
   - estado público de cuenta

La estrategia debe priorizar la preservación de integridad sobre la velocidad. En particular, las operaciones que afectan saldos, estados y stock deben validarse con datos de referencia antes de avanzar al siguiente bloque.

## Estrategia de pruebas

Las pruebas deben cubrir tres niveles:

- pruebas unitarias de validaciones y cálculos de negocio
- pruebas de integración de Server Actions y base de datos
- pruebas funcionales de usuario sobre los flujos críticos

Los flujos críticos que deben cubrirse son:

- login administrativo
- creación y edición de clientes
- creación y edición de productos
- registro de ventas pagadas y fiadas
- registro de pagos y liquidación de deudas
- creación y cancelación de pedidos
- generación de reportes
- acceso público al estado de cuenta

## Estrategia de despliegue

El despliegue debe realizarse de forma controlada y reversible:

1. preparar el entorno objetivo con Supabase Postgres
2. validar infraestructura, permisos y rutas críticas
3. ejecutar migración de datos en un ambiente de preproducción o staging
4. ejecutar pruebas funcionales completas y comprobar los checksums de integridad antes del corte
5. realizar cutover con punto de control y registro de estado
6. activar monitoreo y verificación de negocio inmediato con métricas de latido y alertas operativas

## Estrategia de rollback

El rollback debe basarse en una estrategia de reversión operativa, no en un cambio de código improvisado. Las acciones mínimas recomendadas son:

- conservar una copia del estado de la base anterior antes del cutover
- mantener la configuración de la app en un estado que permita volver al origen sin pérdida de datos críticos
- preparar un plan de restauración de datos y de variables de entorno
- documentar claramente qué módulos deben verificarse para confirmar el retorno al estado anterior

## Riesgos globales

- migración incompleta de datos maestros o transaccionales
- inconsistencias en estados financieros y saldos pendientes
- políticas RLS que bloqueen rutas utilizadas por la administración o por el estado público
- mezcla inapropiada de clientes de acceso que bypassen o invaliden las políticas de seguridad
- errores de integración entre Server Actions y base remota
- fallas en el cutover si no se valida el estado previo y posterior
- falta de un plan de catch-up para transacciones de última hora que cambian continuamente
- ausencia de smoke tests automatizados que invaliden rápidamente un despliegue defectuoso
- presión excesiva para migrar todo el volumen de datos en el release inicial, lo que aumenta el riesgo de errores operativos
## Deuda técnica detectada

- la aplicación hoy depende de una base local y de un modelo de persistencia muy acoplado al runtime actual
- la sesión administrativa está implementada de forma manual y tendría beneficios claros al alinearse con un proveedor estándar
- la lógica de saldos y estados está dispersa entre varios módulos y requiere validación continua durante la migración
- la auditoría y los reportes son funcionalmente valiosos, pero su consistencia depende de que se migren correctamente las tablas transaccionales subyacentes

## Mejoras futuras no incluidas en esta migración

- re-diseño completo de la experiencia de usuario
- separación del backend en servicios independientes
- almacenamiento externo de archivos más robusto que logoDataUrl
- automatización avanzada de observabilidad y alertas
- integración con medios de pago externos o sistemas contables
