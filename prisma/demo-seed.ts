import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/session";

const prisma = new PrismaClient();

function estadoToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

async function main() {
  if (process.env.ALLOW_DEMO_RESET !== "1") {
    throw new Error("ALLOW_DEMO_RESET=1 requerido para cargar datos demo.");
  }

  await prisma.$transaction([
    prisma.pago.deleteMany(),
    prisma.detalleVenta.deleteMany(),
    prisma.venta.deleteMany(),
    prisma.pedido.deleteMany(),
    prisma.movimientoInventario.deleteMany(),
    prisma.producto.deleteMany(),
    prisma.cliente.deleteMany(),
    prisma.configuracion.deleteMany(),
    prisma.usuario.deleteMany()
  ]);

  await prisma.usuario.create({
    data: { usuario: "admin", passwordHash: await hashPassword(process.env.ADMIN_PASSWORD || "demo12345") }
  });

  await prisma.configuracion.create({
    data: {
      id: 1,
      negocioNombre: "Demo Cobros",
      banco: "Santander",
      titular: "CUENTA DEMO",
      clabe: "000000000000000000",
      cuenta: "00000000000"
    }
  });

  const [ana, luis, martha] = await Promise.all([
    prisma.cliente.create({ data: { nombre: "Ana Lopez", telefono: "5551112233", estadoToken: estadoToken() } }),
    prisma.cliente.create({ data: { nombre: "Luis Perez", telefono: "5552223344", estadoToken: estadoToken() } }),
    prisma.cliente.create({ data: { nombre: "Martha Ruiz", telefono: "5553334455", estadoToken: estadoToken() } })
  ]);

  const [productoA, productoB, productoC] = await Promise.all([
    prisma.producto.create({ data: { nombre: "Producto chico", precioVenta: 20, costo: 10 } }),
    prisma.producto.create({ data: { nombre: "Producto mediano", precioVenta: 40, costo: 18 } }),
    prisma.producto.create({ data: { nombre: "Producto especial", precioVenta: 75, costo: 35 } })
  ]);

  await prisma.venta.create({
    data: {
      clienteId: ana.id,
      estado: "PAGADA",
      subtotal: 40,
      total: 40,
      costoTotal: 20,
      utilidadTotal: 20,
      observaciones: "Venta demo",
      detalles: { create: { productoId: productoA.id, cantidad: 2, precioUnitario: 20, costoUnitario: 10, subtotal: 40 } },
      pagos: { create: { monto: 40, metodo: "EFECTIVO" } }
    }
  });

  await prisma.venta.create({
    data: {
      clienteId: luis.id,
      estado: "FIADA",
      subtotal: 80,
      total: 80,
      costoTotal: 36,
      utilidadTotal: 44,
      observaciones: "Fiado demo",
      detalles: { create: { productoId: productoB.id, cantidad: 2, precioUnitario: 40, costoUnitario: 18, subtotal: 80 } }
    }
  });

  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  await prisma.pedido.create({
    data: {
      clienteId: martha.id,
      productoId: productoC.id,
      piezas: 3,
      fechaEntrega: manana,
      notas: "Pedido demo para probar encargos"
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
