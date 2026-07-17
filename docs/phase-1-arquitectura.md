# Delicias Lia - Fase 1

Sistema local para ventas, fiados e inventario de postres artesanales.

## Arquitectura

Stack aprobado:

- Next.js 15 con App Router para UI, Server Actions y rutas internas.
- TypeScript estricto para reducir errores de datos y contratos.
- TailwindCSS para estilos simples, rapidos y consistentes.
- Prisma ORM con SQLite en disco fuera del codigo fuente.
- Zod para validar entradas antes de tocar la base de datos.
- React Hook Form solo en formularios editables.
- next-pwa para instalacion Android y cache offline basico.
- Chart.js solo para reportes con graficas.
- PM2 y Nginx para ejecucion en Ubuntu 24.04 LTS.

Decisiones:

- Monolito Next.js: suficiente para un negocio local, menos piezas que operar.
- SQLite: simple, durable, respaldable con un archivo.
- Prisma: migraciones claras y tipos generados.
- Server Actions primero: menos API propia que mantener.
- Base de datos fuera de `app/`: actualizaciones por `git pull` no tocan datos.
- Offline inicial solo lectura: historial, clientes y productos cacheados; escritura offline se agrega si realmente hace falta.

## Estructura

```text
/opt/delicias-lia/
  app/                         # repositorio desplegado
    app/
      (app)/
        page.tsx               # inicio
        ventas/
        fiados/
        clientes/
        productos/
        inventario/
        historial/
        reportes/
        respaldos/
      api/
        health/
      layout.tsx
      manifest.ts
    components/
      layout/
      ui/
      ventas/
      clientes/
      productos/
      reportes/
    lib/
      db.ts
      money.ts
      dates.ts
      validators/
      services/
    prisma/
      schema.prisma
      seed.ts
    public/
      icons/
    scripts/
      backup.sh
      restore.sh
    docs/
    package.json
    README.md
  database/
    database.sqlite
  backups/
  logs/
  uploads/
```

## Modelo Entidad-Relacion

```text
Cliente 1----* Venta 1----* DetalleVenta *----1 Producto
                 |
                 *----* Pago

Producto 1----* MovimientoInventario
```

Reglas:

- `Cliente General` se crea en seed y no se elimina.
- Una venta puede ser `PAGADA`, `FIADA`, `PARCIAL` o `CANCELADA`.
- Cada venta descuenta inventario con movimientos tipo `VENTA`.
- Los pagos actualizan el estado de la venta segun saldo restante.
- Productos y clientes se desactivan; no se borran si tienen historial.

## Navegacion

```text
Inicio
  -> Nueva venta
  -> Cobrar fiado
  -> Clientes
  -> Productos
  -> Inventario
  -> Historial
  -> Reportes
  -> Respaldos

Nueva venta
  -> Cliente
  -> Productos
  -> Resumen
  -> Guardar

Clientes
  -> Detalle cliente
  -> Registrar pago

Productos
  -> Agregar / editar producto
  -> Ajustar stock
```

## Wireframes ASCII

### Inicio

```text
+--------------------------------+
| Delicias Lia              (menu)|
| Hoy                            |
| [Ventas] [Cobrado]             |
| [$ Dia]  [Fiado]               |
| [Poco inventario]              |
|                                |
| + Nueva venta                  |
| + Cobrar fiado                 |
| Clientes   Productos           |
| Historial  Reportes            |
+--------------------------------+
```

### Nueva venta

```text
+--------------------------------+
| Nueva venta              Total |
| Cliente: Cliente General       |
|                                |
| [Chocoflan $35] [ + ]          |
| [Gelatina  $20] [ + ]          |
| [Pay       $45] [ + ]          |
|                                |
| Carrito                        |
| Chocoflan      [-] 2 [+] $70   |
|                                |
| Descuento: [____]              |
| Pagada ( )  Fiada ( )          |
| [Guardar venta]                |
+--------------------------------+
```

### Cobrar fiados

```text
+--------------------------------+
| Cobrar fiados                  |
| Orden: Mayor deuda             |
|                                |
| Juan Perez          $105       |
| Ultima compra: hoy             |
| [Cobrar]                       |
|                                |
| Maria Lopez         $70        |
| [Cobrar]                       |
+--------------------------------+
```

### Clientes

```text
+--------------------------------+
| Clientes                 [+]   |
| Buscar...                      |
|                                |
| Cliente General     $0         |
| 12 compras - hoy               |
|                                |
| Juan Perez          $105       |
| 3 compras - ayer               |
+--------------------------------+
```

### Detalle cliente

```text
+--------------------------------+
| Juan Perez                     |
| Saldo: $105                    |
| [Registrar pago]               |
|                                |
| Ventas                         |
| FIADA     $70    09:10         |
| PARCIAL   $35    ayer          |
|                                |
| Pagos                          |
| Efectivo -$20    ayer          |
+--------------------------------+
```

### Productos

```text
+--------------------------------+
| Productos                [+]   |
| Buscar...                      |
|                                |
| Chocoflan       $35  stock 8   |
| costo $18       Postres        |
|                                |
| Gelatina        $20  stock 2 ! |
+--------------------------------+
```

### Inventario

```text
+--------------------------------+
| Inventario                     |
| [Entrada] [Ajuste]             |
|                                |
| Chocoflan  VENTA   -2  09:10   |
| Gelatina   ENTRADA +12 ayer    |
+--------------------------------+
```

### Historial

```text
+--------------------------------+
| Historial                      |
| [Hoy] [Semana] [Mes]           |
|                                |
| Venta pagada                   |
| Cliente General $70 09:10      |
|                                |
| Pago recibido                  |
| Juan Perez -$35 13:45          |
+--------------------------------+
```

### Reportes

```text
+--------------------------------+
| Reportes                       |
| [Dia] [Semana] [Mes]           |
|                                |
| Ventas       $1,250            |
| Ganancia       $520            |
| Fiado          $210            |
|                                |
| [Grafica ventas]               |
| [Exportar CSV]                 |
+--------------------------------+
```

### Respaldos

```text
+--------------------------------+
| Respaldos                      |
| Ultimo: 2026-07-17 09:00       |
| [Crear respaldo]               |
|                                |
| backup-2026-07-17.sqlite.gz    |
| [Descargar] [Restaurar]        |
+--------------------------------+
```

## Componentes Reutilizables

- `AppShell`: contenedor movil con navegacion inferior.
- `MetricCard`: tarjetas de ventas, cobrado, fiado y ganancia.
- `ActionButton`: accion grande tactil.
- `ProductTile`: producto tocable para venta rapida.
- `QuantityStepper`: cantidad con menos/mas.
- `MoneyInput`: monto validado.
- `StatusBadge`: estados de venta e inventario.
- `EmptyState`: listas sin datos.
- `ConfirmDialog`: cancelar, desactivar, restaurar.
- `DataList`: listas moviles con busqueda simple.

## Plan de Desarrollo

1. Base tecnica: Next.js, Tailwind, Prisma, SQLite, tema, PWA minima.
2. Datos base: schema, migracion, seed con `Cliente General`.
3. Productos: alta, edicion, desactivacion, stock y costo.
4. Venta rapida: carrito, totales, fiado/pagado, movimientos de inventario.
5. Clientes y fiados: saldos, pagos parciales, estados automaticos.
6. Historial e inventario: timeline y filtros simples.
7. Reportes: metricas, Chart.js y CSV.
8. Respaldos: scripts, pantalla de respaldo y restauracion guiada.
9. Deploy: PM2, Nginx, systemd opcional, README operativo.

## Fuera de Fase 1

- Autenticacion multiusuario.
- Escritura offline.
- Facturacion o impuestos.
- Roles y permisos.
- APIs externas.
