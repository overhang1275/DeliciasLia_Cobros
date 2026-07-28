"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { StatementPDF, type StatementData } from "./StatementPDF";
import { FileText } from "@/components/AppIcon";

export function DownloadStatementButton(props: StatementData) {
  return (
    <PDFDownloadLink
      document={<StatementPDF {...props} />}
      fileName={`EstadoCuenta_${props.cliente.nombre.replace(/\s+/g, "_")}.pdf`}
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

