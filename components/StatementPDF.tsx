"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

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
      tipo: "cargo" | "abono";
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
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottom: "2px solid #1a3a5c",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a3a5c",
  },
  negocioSubtitulo: {
    fontSize: 10,
    color: "#4a6a8c",
    marginBottom: 4,
  },
  clienteNombre: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a3a5c",
  },
  clienteDetalle: {
    fontSize: 9,
    color: "#666",
  },
  fechaGen: {
    fontSize: 8,
    color: "#999",
    marginTop: 2,
  },
  resumenBox: {
    backgroundColor: "#f2f6fa",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    border: "1px solid #d0dce8",
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
    color: "#1a3a5c",
  },
  saldoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c62828",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a3a5c",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: "1px solid #d0dce8",
  },
  grupo: {
    marginBottom: 12,
    border: "1px solid #e8edf2",
    borderRadius: 4,
    overflow: "hidden",
  },
  grupoFecha: {
    backgroundColor: "#e8edf2",
    padding: 6,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a3a5c",
  },
  movimientoRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottom: "1px solid #f0f0f0",
  },
  movimientoCol: {
    flex: 1,
  },
  movimientoConcepto: {
    fontSize: 10,
    fontWeight: "bold",
  },
  movimientoDetalle: {
    fontSize: 8,
    color: "#666",
  },
  movimientoFolio: {
    fontSize: 7,
    color: "#999",
  },
  movimientoImporte: {
    fontSize: 10,
    fontWeight: "bold",
    width: 80,
    textAlign: "right",
  },
  importeCargo: { color: "#c62828" },
  importeAbono: { color: "#2e7d32" },
  totalDiaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 6,
    paddingHorizontal: 10,
    borderTop: "2px solid #d0dce8",
  },
  totalDiaLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  totalDiaValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 24,
    borderTop: "2px solid #1a3a5c",
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
    color: "#1a3a5c",
  },
});

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export function StatementPDF({ cliente, grupos, saldo, config, fechaGenerado }: StatementData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {config.logoDataUrl && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={config.logoDataUrl} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.negocioNombre}>{config.negocioNombre}</Text>
            <Text style={styles.negocioSubtitulo}>Estado de cuenta</Text>
            <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
            <Text style={styles.clienteDetalle}>
              Teléfono: {cliente.telefono || "—"}
            </Text>
            <Text style={styles.fechaGen}>Generado el {fechaGenerado}</Text>
          </View>
        </View>

        {/* Resumen */}
        <View style={styles.resumenBox}>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Saldo actual</Text>
            <Text style={styles.saldoValue}>{money.format(saldo)}</Text>
          </View>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Número de movimientos</Text>
            <Text style={styles.resumenValue}>
              {grupos.reduce((acc, g) => acc + g.movimientos.length, 0)}
            </Text>
          </View>
        </View>

        {/* Movimientos */}
        <Text style={styles.sectionTitle}>Detalle de movimientos</Text>

        {grupos.map((grupo) => (
          <View key={grupo.key} style={styles.grupo}>
            <Text style={styles.grupoFecha}>{grupo.fecha}</Text>
            {grupo.movimientos.map((mov) => (
              <View key={mov.id} style={styles.movimientoRow}>
                <View style={styles.movimientoCol}>
                  <Text style={styles.movimientoConcepto}>{mov.concepto}</Text>
                  <Text style={styles.movimientoDetalle}>{mov.detalle}</Text>
                  <Text style={styles.movimientoFolio}>{mov.folio}</Text>
                </View>
                <Text
                  style={[
                    styles.movimientoImporte,
                    mov.tipo === "cargo" ? styles.importeCargo : styles.importeAbono,
                  ]}
                >
                  {mov.importe}
                </Text>
              </View>
            ))}
            <View style={styles.totalDiaRow}>
              <Text style={styles.totalDiaLabel}>Total del día</Text>
              <Text style={styles.totalDiaValue}>{grupo.saldo}</Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLine}>
            <Text style={styles.footerNegrita}>Datos para depósito:</Text>{" "}
            {config.banco} - {config.titular}
          </Text>
          <Text style={styles.footerLine}>
            <Text style={styles.footerNegrita}>CLABE:</Text> {config.clabe}{"  "}
            <Text style={styles.footerNegrita}>Cuenta:</Text> {config.cuenta}
          </Text>
          <Text style={styles.footerLine}>
            Este documento es generado automáticamente y no requiere firma.
          </Text>
        </View>
      </Page>
    </Document>
  );
}


