CREATE TABLE "Configuracion" (
  "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
  "negocioNombre" TEXT NOT NULL DEFAULT 'Delicias Lia',
  "logoDataUrl" TEXT,
  "banco" TEXT NOT NULL DEFAULT 'Santander',
  "titular" TEXT NOT NULL DEFAULT 'ALONDRA MONTSERRAT VAZQUEZ LOPEZ',
  "clabe" TEXT NOT NULL DEFAULT '014320140430961714',
  "cuenta" TEXT NOT NULL DEFAULT '14043096171',
  "actualizadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Configuracion" ("id", "negocioNombre", "banco", "titular", "clabe", "cuenta")
VALUES (1, 'Delicias Lia', 'Santander', 'ALONDRA MONTSERRAT VAZQUEZ LOPEZ', '014320140430961714', '14043096171');
