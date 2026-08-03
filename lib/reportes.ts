import { db } from "./db";
import { appDateFormatter, dateInputValue, parseDateInput } from "./timezone";

const day = appDateFormatter({ day: "2-digit", month: "short" });

export async function obtenerReporteData(params: { desde?: string; hasta?: string }) {
  const defaultHasta = new Date();
  const defaultDesde = new Date();
  defaultDesde.setDate(defaultHasta.getDate() - 13);

  const since = parseDateInput(params.desde, defaultDesde);
  const until = parseDateInput(params.hasta, defaultHasta, true);
  const days = Math.max(1, Math.min(60, Math.ceil((until.getTime() - since.getTime()) / 86400000) + 1));
  const range = { gte: since, lte: until };

  const [ventas, pagos, detalles, ventasPendientes, cambiosPendientes] = await Promise.all([
    db.venta.findMany({
      where: { fecha: range, estado: { not: "CANCELADA" } },
      include: { cliente: true, pagos: true },
      orderBy: { fecha: "asc" }
    }),
    db.pago.findMany({ where: { fecha: range }, orderBy: { fecha: "asc" } }),
    db.detalleVenta.findMany({
      where: { venta: { fecha: range, estado: { not: "CANCELADA" } } }
    }),
    db.venta.findMany({
      where: { estado: { in: ["FIADA", "PARCIAL"] } },
      include: { cliente: true, pagos: true }
    }),
    db.venta.findMany({
      where: { cambioPendiente: true, cambioMonto: { gt: 0 } },
      include: { cliente: true },
      orderBy: { fecha: "asc" },
      take: 8
    })
  ]);

  const totalVentas = ventas.reduce((sum, venta) => sum + Number(venta.total), 0);
  const cobrado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
  const piezasVendidas = detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0);
  const creditoGenerado = ventas.reduce((sum, venta) => {
    const pagado = venta.pagos.reduce((subtotal, pago) => subtotal + Number(pago.monto), 0);
    return sum + Math.max(0, Number(venta.total) - pagado);
  }, 0);
  const deudaTotal = ventasPendientes.reduce((sum, venta) => {
    const pagado = venta.pagos.reduce((subtotal, pago) => subtotal + Number(pago.monto), 0);
    return sum + Math.max(0, Number(venta.total) - pagado);
  }, 0);
  const totalCambiosPendientes = cambiosPendientes.reduce((sum, venta) => sum + Number(venta.cambioMonto), 0);
  const ticketPromedio = ventas.length ? totalVentas / ventas.length : 0;
  const ventasConCredito = ventas.filter((venta) => venta.estado === "FIADA" || venta.estado === "PARCIAL");

  const ventasPorDia = Array.from({ length: days }, (_, i) => {
    const date = new Date(since);
    date.setDate(since.getDate() + i);
    const key = dateInputValue(date);
    const ventasDia = ventas.filter((venta) => dateInputValue(venta.fecha) === key);
    const total = ventasDia.reduce((sum, venta) => sum + Number(venta.total), 0);
    return { label: day.format(date), total };
  }).filter((item) => item.total > 0);
  const maxDia = Math.max(...ventasPorDia.map((item) => item.total), 0);

  const pagosPorDia = Array.from({ length: days }, (_, i) => {
    const date = new Date(since);
    date.setDate(since.getDate() + i);
    const key = dateInputValue(date);
    const pagosDia = pagos.filter((pago) => dateInputValue(pago.fecha) === key);
    const total = pagosDia.reduce((sum, pago) => sum + Number(pago.monto), 0);
    return { label: day.format(date), total };
  }).filter((item) => item.total > 0);
  const maxPagoDia = Math.max(...pagosPorDia.map((item) => item.total), 0);

  const clientes = new Map<number, { nombre: string; compras: number; total: number }>();
  for (const venta of ventas) {
    const actual = clientes.get(venta.clienteId) || { nombre: venta.cliente.nombre, compras: 0, total: 0 };
    clientes.set(venta.clienteId, {
      nombre: actual.nombre,
      compras: actual.compras + 1,
      total: actual.total + Number(venta.total)
    });
  }
  const topClientes = [...clientes.values()]
    .map((data) => ({ promedio: data.total / data.compras, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxCliente = Math.max(...topClientes.map((item) => item.total), 0);

  const pagosPorMetodo = ["EFECTIVO", "TRANSFERENCIA"].map((metodo) => ({
    metodo,
    total: pagos.filter((pago) => pago.metodo === metodo).reduce((sum, pago) => sum + Number(pago.monto), 0)
  }));
  const totalPorMetodo = pagosPorMetodo.reduce((sum, item) => sum + item.total, 0);
  const efectivo = pagosPorMetodo.find((item) => item.metodo === "EFECTIVO")?.total || 0;
  const efectivoPct = totalPorMetodo > 0 ? Math.round((efectivo / totalPorMetodo) * 100) : 0;

  const deudores = new Map<string, number>();
  for (const venta of ventasPendientes) {
    const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
    const pendiente = Math.max(0, Number(venta.total) - pagado);
    if (pendiente > 0) deudores.set(venta.cliente.nombre, (deudores.get(venta.cliente.nombre) || 0) + pendiente);
  }
  const listaDeudores = [...deudores.entries()]
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return {
    cambiosPendientes,
    cobrado,
    creditoGenerado,
    deudaTotal,
    efectivo,
    efectivoPct,
    listaDeudores,
    maxCliente,
    maxDia,
    maxPagoDia,
    pagosPorDia,
    pagosPorMetodo,
    piezasVendidas,
    since,
    ticketPromedio,
    topClientes,
    totalCambiosPendientes,
    totalPorMetodo,
    totalVentas,
    until,
    ventas,
    ventasConCredito,
    ventasPorDia
  };
}
