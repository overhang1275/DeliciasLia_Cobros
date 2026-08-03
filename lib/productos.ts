import { db } from "./db";

export function listarProductosActivos() {
  return db.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });
}
