CREATE TABLE "AuditLog" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "accion" TEXT NOT NULL,
  "entidad" TEXT NOT NULL,
  "entidadId" INTEGER,
  "detalle" TEXT,
  "usuario" TEXT,
  "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AuditLog_creadoEn_idx" ON "AuditLog"("creadoEn");
CREATE INDEX "AuditLog_entidad_entidadId_idx" ON "AuditLog"("entidad", "entidadId");
