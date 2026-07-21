"use client";

import { useState } from "react";
import { ConfigAccordionItem } from "@/app/configuracion/ConfigAccordionItem";
import { Check, ReceiptText } from "@/components/AppIcon";

type Movimiento = {
  concepto: string;
  detalle: string;
  folio: string;
  hora: string;
  id: string;
  importe: string;
  tipo: "abono" | "cargo";
};

type Grupo = {
  cargos: string;
  fecha: string;
  key: string;
  movimientos: Movimiento[];
  pagos: string;
  saldo: string;
};

export function EstadoMovimientosAccordion({ grupos }: { grupos: Grupo[] }) {
  const [openKey, setOpenKey] = useState(grupos[0]?.key ?? "");

  return (
    <div className="grid gap-3">
      {grupos.map((grupo) => (
        <ConfigAccordionItem
          description={
            <span className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span>{grupo.movimientos.length} movimientos</span>
              <span>Saldo: {grupo.saldo}</span>
              <span className="text-red-700">Cargos: {grupo.cargos}</span>
              <span className="text-green-700">Pagos: {grupo.pagos}</span>
            </span>
          }
          isOpen={openKey === grupo.key}
          key={grupo.key}
          onOpenChange={(isOpen) => setOpenKey(isOpen ? grupo.key : "")}
          title={grupo.fecha}
        >
          {grupo.movimientos.map((movimiento) => (
            <article className="border-b border-[var(--border-soft)] pb-4 last:border-b-0 last:pb-0" key={movimiento.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${movimiento.tipo === "abono" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`} aria-hidden="true">
                    {movimiento.tipo === "abono" ? <Check className="size-5" /> : <ReceiptText className="size-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-main)]">{movimiento.folio}</p>
                    <p className="text-sm text-[var(--text-main)]">{movimiento.concepto}</p>
                    <p className="ui-label">
                      {movimiento.hora} - {movimiento.detalle}
                    </p>
                  </div>
                </div>
                <p className={`shrink-0 text-sm font-bold ${movimiento.tipo === "abono" ? "text-green-700" : "text-red-700"}`}>{movimiento.importe}</p>
              </div>
            </article>
          ))}
        </ConfigAccordionItem>
      ))}
    </div>
  );
}
