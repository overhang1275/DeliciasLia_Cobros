"use client";

import { useMemo, useState } from "react";

type ClienteOption = {
  id: number;
  nombre: string;
  telefono?: string | null;
};

export function ClienteSearchField({ clientes, defaultClienteId }: { clientes: ClienteOption[]; defaultClienteId?: number }) {
  const clienteDefault = clientes.find((cliente) => cliente.id === defaultClienteId);
  const [query, setQuery] = useState(clienteDefault?.nombre || "");
  const [clienteId, setClienteId] = useState(clienteDefault ? String(clienteDefault.id) : "");
  const resultados = useMemo(() => {
    const texto = query.trim().toLowerCase();
    if (!texto) return clientes.slice(0, 6);
    return clientes.filter((cliente) => cliente.nombre.toLowerCase().includes(texto)).slice(0, 6);
  }, [clientes, query]);

  return (
    <div>
      <label className="ui-label" htmlFor="clienteBusqueda">
        Cliente
      </label>
      <input
        autoComplete="off"
        className="ui-input mt-2"
        id="clienteBusqueda"
        placeholder="Escribe el nombre del cliente"
        required
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setClienteId("");
        }}
      />
      <select className="sr-only" name="clienteId" required value={clienteId} onChange={() => {}} tabIndex={-1}>
        <option value="">Selecciona cliente</option>
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nombre}
          </option>
        ))}
      </select>
      {query && clienteId === "" ? (
        <div className="mt-2 grid gap-2">
          {resultados.length === 0 ? (
            <p className="ui-label px-2">Sin resultados.</p>
          ) : (
            resultados.map((cliente) => (
              <button
                className="rounded-2xl bg-[var(--primary-soft)] px-4 py-3 text-left font-bold text-[var(--primary)]"
                key={cliente.id}
                type="button"
                onClick={() => {
                  setClienteId(String(cliente.id));
                  setQuery(cliente.nombre);
                }}
              >
                {cliente.nombre}
                {cliente.telefono ? <span className="block text-sm font-normal text-[var(--text-muted)]">{cliente.telefono}</span> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
