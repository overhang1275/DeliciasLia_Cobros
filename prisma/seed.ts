import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clienteGeneral = await prisma.cliente.findFirst({ where: { nombre: "Cliente General" } });

  if (clienteGeneral) {
    await prisma.cliente.update({ where: { id: clienteGeneral.id }, data: { activo: true } });
    return;
  }

  await prisma.cliente.create({ data: { nombre: "Cliente General" } });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
