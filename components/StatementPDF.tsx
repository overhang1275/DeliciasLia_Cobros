"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export interface StatementData {
  cliente: {
    nombre: string;
    telefono?: string | null;
  };
  grupos: Array<{
    key: string;
    fecha: string;
    movimientos: Array<{
      id: string;
      concepto: string;
      detalle: string;
      folio: string;
      importe: string;
      tipo: "cargo" | "abono" | "cambio";
    }>;
    saldo: string;
  }>;
  saldo: number;
  config: {
    negocioNombre: string;
    logoDataUrl?: string | null;
    banco: string;
    titular: string;
    clabe: string;
    cuenta: string;
  };
  fechaGenerado: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: "3px solid #14324d",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 6,
  },
  headerText: {
    flex: 1,
  },
  negocioNombre: {
    fontSize: 10,
    color: "#5f6f7f",
    marginBottom: 4,
  },
  documentTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#14324d",
  },
  negocioSubtitulo: {
    fontSize: 9,
    color: "#5f6f7f",
    marginTop: 3,
    textTransform: "uppercase",
  },
  codeBox: {
    width: 82,
    padding: 8,
    border: "1px solid #d9e1e8",
    borderRadius: 4,
    alignItems: "center",
  },
  codeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#14324d",
  },
  codeLabel: {
    fontSize: 9,
    color: "#5f6f7f",
  },
  detailGrid: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailCol: {
    flex: 1,
    paddingRight: 18,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#14324d",
    marginBottom: 8,
  },
  detailRow: {
    marginBottom: 7,
  },
  detailLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 10,
    color: "#111827",
    marginTop: 2,
  },
  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  resumenLabel: {
    fontSize: 10,
    color: "#4a6a8c",
    fontWeight: "bold",
  },
  resumenValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#14324d",
  },
  saldoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c62828",
  },
  noteBox: {
    backgroundColor: "#f6f8fa",
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
    border: "1px solid #e5ebf0",
  },
  noteText: {
    color: "#4b5563",
    lineHeight: 1.4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#14324d",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: "1px solid #d9e1e8",
  },
  table: {
    border: "1px solid #d9e1e8",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e9eef3",
    paddingVertical: 6,
    paddingHorizontal: 7,
  },
  tableHeadText: {
    fontWeight: "bold",
    color: "#14324d",
    fontSize: 8,
    textTransform: "uppercase",
  },
  movimientoRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderBottom: "1px solid #f0f0f0",
  },
  movimientoConcepto: {
    fontSize: 8,
    fontWeight: "bold",
  },
  movimientoDetalle: {
    fontSize: 7,
    color: "#666",
  },
  movimientoFolio: {
    fontSize: 7,
    color: "#999",
  },
  colFecha: { width: 60 },
  colRef: { width: 92, paddingRight: 10 },
  colConcepto: { flex: 1, paddingLeft: 8 },
  colTipo: { width: 78 },
  movimientoImporte: {
    fontSize: 9,
    fontWeight: "bold",
    width: 72,
    textAlign: "right",
  },
  importeCargo: { color: "#c62828" },
  importeAbono: { color: "#2e7d32" },
  importeCambio: { color: "#b45309" },
  footer: {
    marginTop: 24,
    borderTop: "2px solid #14324d",
    paddingTop: 12,
    fontSize: 8,
    color: "#4a6a8c",
    textAlign: "center",
  },
  footerLine: {
    marginBottom: 2,
  },
  footerNegrita: {
    fontWeight: "bold",
    color: "#14324d",
  },
});

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export function StatementPDF({ cliente, grupos, saldo, config, fechaGenerado }: StatementData) {
  const movimientos = grupos.flatMap((grupo) => grupo.movimientos.map((mov) => ({ ...mov, fecha: grupo.fecha })));
  const tipoTexto = (detalle: string) => detalle.replace("Cargo - ", "Credito - ").replace("Abono - ", "Pago - ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {config.logoDataUrl && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={config.logoDataUrl} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.negocioNombre}>{config.negocioNombre}</Text>
            <Text style={styles.documentTitle}>ESTADO DE CUENTA</Text>
            <Text style={styles.negocioSubtitulo}>Documento de cobro y consulta de movimientos</Text>
          </View>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>EC</Text>
            <Text style={styles.codeLabel}>Cliente</Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailCol}>
            <Text style={styles.detailTitle}>Cliente</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nombre</Text>
              <Text style={styles.detailValue}>{cliente.nombre}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Telefono</Text>
              <Text style={styles.detailValue}>{cliente.telefono || "-"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Generado</Text>
              <Text style={styles.detailValue}>{fechaGenerado}</Text>
            </View>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailTitle}>Resumen</Text>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Saldo actual</Text>
              <Text style={styles.saldoValue}>{money.format(saldo)}</Text>
            </View>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Movimientos</Text>
              <Text style={styles.resumenValue}>{movimientos.length}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Banco</Text>
              <Text style={styles.detailValue}>{config.banco}</Text>
            </View>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            Este estado de cuenta muestra creditos, pagos y cambios pendientes. Para liquidar el saldo, utiliza los datos de deposito al final del documento.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Detalle de movimientos</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeadText, styles.colFecha]}>Fecha</Text>
            <Text style={[styles.tableHeadText, styles.colRef]}>Referencia</Text>
            <Text style={[styles.tableHeadText, styles.colConcepto]}>Concepto</Text>
            <Text style={[styles.tableHeadText, styles.colTipo]}>Tipo</Text>
            <Text style={[styles.tableHeadText, styles.movimientoImporte]}>Importe</Text>
          </View>
          {movimientos.map((mov) => (
            <View key={mov.id} style={styles.movimientoRow}>
              <Text style={[styles.movimientoDetalle, styles.colFecha]}>{mov.fecha}</Text>
              <View style={styles.colRef}>
                <Text style={styles.movimientoFolio}>{mov.folio}</Text>
              </View>
              <View style={styles.colConcepto}>
                <Text style={styles.movimientoConcepto}>{mov.concepto}</Text>
              </View>
              <Text style={[styles.movimientoDetalle, styles.colTipo]}>{tipoTexto(mov.detalle)}</Text>
              <Text
                style={[
                  styles.movimientoImporte,
                  mov.tipo === "abono" ? styles.importeAbono : mov.tipo === "cambio" ? styles.importeCambio : styles.importeCargo,
                ]}
              >
                {mov.importe}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLine}>
            <Text style={styles.footerNegrita}>Datos para deposito:</Text> {config.banco} - {config.titular}
          </Text>
          <Text style={styles.footerLine}>
            <Text style={styles.footerNegrita}>CLABE:</Text> {config.clabe}{"  "}
            <Text style={styles.footerNegrita}>Cuenta:</Text> {config.cuenta}
          </Text>
          <Text style={styles.footerLine}>Este documento es generado automaticamente y no requiere firma.</Text>
        </View>
      </Page>
    </Document>
  );
}
