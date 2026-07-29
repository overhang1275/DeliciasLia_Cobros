"use client";

import { useMemo, useState } from "react";
import { Banknote, CreditCard, HandCoins, Landmark, Wallet } from "@/components/AppIcon";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export function PagoFiadoCambioFields({ pendiente }: { pendiente: number }) {
  const [monto, setMonto] = useState(0);
  const [metodo, setMetodo] = useState("EFECTIVO");
  const [deboCambio, setDeboCambio] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState(0);
  const cambio = useMemo(() => Math.max(0, montoRecibido - monto), [monto, montoRecibido]);
  const puedeDeberCambio = metodo === "EFECTIVO";

  return (
    <>
      <div>
        <label className="ui-label inline-flex items-center gap-1" htmlFor="monto">
          Cantidad <HandCoins aria-hidden="true" className="size-4" />
        </label>
        <input
          className="ui-input mt-2"
          id="monto"
          inputMode="decimal"
          max={pendiente}
          min="0.01"
          name="monto"
          placeholder="Cantidad"
          required
          step="0.01"
          type="number"
          value={monto || ""}
          onChange={(event) => setMonto(Number(event.target.value) || 0)}
        />
      </div>

      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="ui-label col-span-2">Tipo de pago</legend>
        <label className="ui-button-secondary">
          <input className="mr-2" checked={metodo === "EFECTIVO"} name="metodo" type="radio" value="EFECTIVO" onChange={(event) => setMetodo(event.target.value)} />
          <Banknote aria-hidden="true" className="mr-2 size-4" />
          Efectivo
        </label>
        <label className="ui-button-secondary">
          <input
            className="mr-2"
            checked={metodo === "TRANSFERENCIA"}
            name="metodo"
            type="radio"
            value="TRANSFERENCIA"
            onChange={(event) => {
              setMetodo(event.target.value);
              setDeboCambio(false);
            }}
          />
          <Landmark aria-hidden="true" className="mr-2 size-4" />
          Transferencia
        </label>
      </fieldset>

      {puedeDeberCambio ? (
        <fieldset className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
          <label className="ui-button-secondary sm:mb-0">
            <input className="mr-2" checked={deboCambio} name="cambioPendiente" type="checkbox" onChange={(event) => setDeboCambio(event.target.checked)} />
            <Wallet aria-hidden="true" className="mr-2 size-4" />
            Debo cambio
          </label>
          <div>
            <label className="ui-label inline-flex items-center gap-1" htmlFor="montoRecibido">
              Billete / pago recibido <CreditCard aria-hidden="true" className="size-4" />
            </label>
            <input className="ui-input mt-2" disabled={!deboCambio} id="montoRecibido" min="0" name="montoRecibido" placeholder="0.00" step="0.01" type="number" value={montoRecibido || ""} onChange={(event) => setMontoRecibido(Number(event.target.value) || 0)} />
          </div>
          {deboCambio ? <p className="rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-2">Cambio pendiente: {money.format(cambio)}</p> : null}
        </fieldset>
      ) : null}
    </>
  );
}
