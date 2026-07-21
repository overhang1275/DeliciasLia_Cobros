import { PrismaClient } from "@prisma/client";
import { randomInt } from "node:crypto";
import { hashPassword } from "../lib/session";

const prisma = new PrismaClient();
const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

function password(length = 12) {
  return Array.from({ length }, () => chars[randomInt(chars.length)]).join("");
}

async function main() {
  const nueva = password();

  await prisma.usuario.upsert({
    where: { usuario: "admin" },
    create: { activo: true, passwordHash: await hashPassword(nueva), usuario: "admin" },
    update: { activo: true, passwordHash: await hashPassword(nueva) }
  });

  await prisma.auditLog
    .create({
      data: {
        accion: "editar",
        detalle: "Contraseña de admin restablecida desde servidor",
        entidad: "Seguridad",
        usuario: "servidor"
      }
    })
    .catch(() => {});

  console.log("Usuario: admin");
  console.log(`Nueva contraseña: ${nueva}`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
