import { db } from "@/lib/db";

export async function getConfiguracion() {
  return db.configuracion.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 }
  });
}
