CREATE TABLE "Cliente" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "nombre" TEXT NOT NULL,
  "telefono" TEXT,
  "notas" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "fechaAlta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Producto" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "categoria" TEXT,
  "precioVenta" DECIMAL NOT NULL,
  "costo" DECIMAL NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "stockMinimo" INTEGER NOT NULL DEFAULT 0,
  "activo" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "Venta" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clienteId" INTEGER NOT NULL,
  "estado" TEXT NOT NULL,
  "subtotal" DECIMAL NOT NULL,
  "descuento" DECIMAL NOT NULL DEFAULT 0,
  "total" DECIMAL NOT NULL,
  "costoTotal" DECIMAL NOT NULL,
  "utilidadTotal" DECIMAL NOT NULL,
  "observaciones" TEXT,
  CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "DetalleVenta" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "ventaId" INTEGER NOT NULL,
  "productoId" INTEGER NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "precioUnitario" DECIMAL NOT NULL,
  "costoUnitario" DECIMAL NOT NULL,
  "subtotal" DECIMAL NOT NULL,
  CONSTRAINT "DetalleVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "DetalleVenta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Pago" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "ventaId" INTEGER NOT NULL,
  "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "monto" DECIMAL NOT NULL,
  "metodo" TEXT NOT NULL,
  CONSTRAINT "Pago_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "MovimientoInventario" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "productoId" INTEGER NOT NULL,
  "tipo" TEXT NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "observaciones" TEXT,
  CONSTRAINT "MovimientoInventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");
CREATE INDEX "Producto_nombre_idx" ON "Producto"("nombre");
CREATE INDEX "Producto_categoria_idx" ON "Producto"("categoria");
CREATE INDEX "Venta_fecha_idx" ON "Venta"("fecha");
CREATE INDEX "Venta_clienteId_idx" ON "Venta"("clienteId");
CREATE INDEX "Venta_estado_idx" ON "Venta"("estado");
CREATE INDEX "DetalleVenta_ventaId_idx" ON "DetalleVenta"("ventaId");
CREATE INDEX "DetalleVenta_productoId_idx" ON "DetalleVenta"("productoId");
CREATE INDEX "Pago_ventaId_idx" ON "Pago"("ventaId");
CREATE INDEX "Pago_fecha_idx" ON "Pago"("fecha");
CREATE INDEX "MovimientoInventario_productoId_idx" ON "MovimientoInventario"("productoId");
CREATE INDEX "MovimientoInventario_fecha_idx" ON "MovimientoInventario"("fecha");
CREATE INDEX "MovimientoInventario_tipo_idx" ON "MovimientoInventario"("tipo");
