import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/session";

const prisma = new PrismaClient();

function estadoToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

async function main() {
  const admin = await prisma.usuario.findUnique({ where: { usuario: "admin" } });

  if (admin) {
    await prisma.usuario.update({ where: { usuario: "admin" }, data: { activo: true } });
  } else {
    const password = process.env.ADMIN_PASSWORD || crypto.randomUUID().replaceAll("-", "").slice(0, 12);
    await prisma.usuario.create({ data: { usuario: "admin", passwordHash: await hashPassword(password) } });
    console.log(`ADMIN_PASSWORD=${password}`);
  }

  const clienteGeneral = await prisma.cliente.findFirst({ where: { nombre: "Cliente General" } });

  if (clienteGeneral) {
    await prisma.cliente.update({ where: { id: clienteGeneral.id }, data: { activo: true, estadoToken: clienteGeneral.estadoToken || estadoToken() } });
    return;
  }

  await prisma.cliente.create({ data: { nombre: "Cliente General", estadoToken: estadoToken() } });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
