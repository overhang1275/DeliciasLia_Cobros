ALTER TABLE "Cliente" ADD COLUMN "estadoToken" TEXT;

CREATE UNIQUE INDEX "Cliente_estadoToken_key" ON "Cliente"("estadoToken");
