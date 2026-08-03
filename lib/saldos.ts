type PagoLike = { monto: unknown };
type VentaLike = { total: unknown; pagos: PagoLike[] };
type VentaConCambioLike = VentaLike & { cambioMonto?: unknown; cambioPendiente?: boolean; fecha?: Date };

export function saldoVenta(venta: VentaLike) {
  const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
  return Math.max(0, Number(venta.total) - pagado);
}

export function saldoVentas(ventas: VentaLike[]) {
  return ventas.reduce((sum, venta) => sum + saldoVenta(venta), 0);
}

export function cambioPendienteVentas(ventas: VentaConCambioLike[]) {
  return ventas.reduce((sum, venta) => sum + (venta.cambioPendiente ? Number(venta.cambioMonto || 0) : 0), 0);
}

export function fechaSaldoMasViejo(ventas: VentaConCambioLike[]) {
  return ventas
    .filter((venta) => venta.fecha && saldoVenta(venta) > 0)
    .sort((a, b) => a.fecha!.getTime() - b.fecha!.getTime())[0]?.fecha;
}
