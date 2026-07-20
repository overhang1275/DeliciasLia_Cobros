"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ProductoOption = {
  id: number;
  label: string;
  precioVenta: number;
};

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export function CambioPendienteFields({ productos, defaultProductoId, defaultPiezas = 1 }: { productos: ProductoOption[]; defaultProductoId?: number; defaultPiezas?: number }) {
  const router = useRouter();
  const [productoId, setProductoId] = useState(defaultProductoId ? String(defaultProductoId) : "");
  const [piezas, setPiezas] = useState(defaultPiezas);
  const [estado, setEstado] = useState("PAGADA");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [deboCambio, setDeboCambio] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState(0);
  const producto = productos.find((item) => item.id === Number(productoId));
  const total = (producto?.precioVenta || 0) * piezas;
  const cambio = useMemo(() => Math.max(0, montoRecibido - total), [montoRecibido, total]);
  const puedeDeberCambio = estado === "PAGADA" && metodoPago === "EFECTIVO";

  return (
    <>
      <fieldset className="grid grid-cols-2 gap-3">
        <label className="ui-button-secondary">
          <input className="mr-2" checked={estado === "PAGADA"} name="estado" type="radio" value="PAGADA" onChange={(event) => setEstado(event.target.value)} />
          💵 Pagada
        </label>
        <label className="ui-button-secondary">
          <input className="mr-2" checked={estado === "FIADA"} name="estado" type="radio" value="FIADA" onChange={() => router.push("/fiados")} />
          📒 Fiada
        </label>
      </fieldset>

      {estado === "PAGADA" ? (
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="ui-label col-span-2">Forma de pago</legend>
          <label className="ui-button-secondary">
            <input className="mr-2" checked={metodoPago === "EFECTIVO"} name="metodoPago" type="radio" value="EFECTIVO" onChange={(event) => setMetodoPago(event.target.value)} />
            💵 Efectivo
          </label>
          <label className="ui-button-secondary">
            <input className="mr-2" checked={metodoPago === "TRANSFERENCIA"} name="metodoPago" type="radio" value="TRANSFERENCIA" onChange={(event) => setMetodoPago(event.target.value)} />
            🏦 Transferencia
          </label>
        </fieldset>
      ) : null}

      <div>
        <label className="ui-label" htmlFor="productoId">
          Producto 📦
        </label>
        <select className="ui-input mt-2" id="productoId" name="productoId" required value={productoId} onChange={(event) => setProductoId(event.target.value)}>
          <option value="">Selecciona producto</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.label}
            </option>
          ))}
        </select>
        {productos.length === 0 ? (
          <Link className="mt-2 inline-block text-sm font-bold text-[var(--primary)]" href="/productos">
            Agregar productos
          </Link>
        ) : null}
      </div>

      <div>
        <label className="ui-label" htmlFor="piezas">
          Piezas 🔢
        </label>
        <input className="ui-input mt-2" id="piezas" inputMode="numeric" min="1" name="piezas" placeholder="1" required type="number" value={piezas} onChange={(event) => setPiezas(Math.max(1, Number(event.target.value) || 1))} />
      </div>

      {puedeDeberCambio ? (
        <fieldset className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
          <label className="ui-button-secondary sm:mb-0">
            <input className="mr-2" checked={deboCambio} name="cambioPendiente" type="checkbox" onChange={(event) => setDeboCambio(event.target.checked)} />
            💸 Debo cambio
          </label>
          <div>
            <label className="ui-label" htmlFor="montoRecibido">
              Billete / pago recibido
            </label>
            <input className="ui-input mt-2" disabled={!deboCambio} id="montoRecibido" min="0" name="montoRecibido" placeholder="0.00" step="0.01" type="number" value={montoRecibido || ""} onChange={(event) => setMontoRecibido(Number(event.target.value) || 0)} />
          </div>
          {deboCambio ? (
            <p className="rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-2">
              Cambio pendiente: {money.format(cambio)}
            </p>
          ) : null}
        </fieldset>
      ) : null}
    </>
  );
}
