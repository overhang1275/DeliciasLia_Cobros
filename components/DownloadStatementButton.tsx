"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { StatementPDF } from "./StatementPDF";
import { FileText } from "@/components/AppIcon";

export function DownloadStatementButton({ cliente, grupos, saldo, config, fechaGenerado }: any) {
  return (
    <PDFDownloadLink
      document={<StatementPDF cliente={cliente} grupos={grupos} saldo={saldo} config={config} fechaGenerado={fechaGenerado} />}
      fileName={`EstadoCuenta_${cliente.nombre.replace(/\s+/g, "_")}.pdf`}
    >
      {({ loading }) => (
        <button className="ui-button-compact gap-2" disabled={loading}>
          <FileText className="size-4" />
          {loading ? "Generando..." : "Descargar PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
