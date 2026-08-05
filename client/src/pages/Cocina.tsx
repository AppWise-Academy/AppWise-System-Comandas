// ============================================================
// pages/Cocina.tsx — Kitchen Display System
// ============================================================

import { useComandas, useCambiarEstadoComanda, useCambiarEstadoItem } from "../hooks/queries";
import { Spinner, ErrorMsg, Alert } from "../components/ui/Feedback";
import { Btn } from "../components/ui/Btn";
import { minutosDesde } from "../lib";
import { useState } from "react";
import type { Comanda, EstadoComanda, ItemComanda } from "../types";

const COLUMNAS: { estado: EstadoComanda; titulo: string; clase: string }[] = [
  { estado: "pendiente",      titulo: "Nuevos pedidos",     clase: "bg-amber-100 text-amber-800" },
  { estado: "en_preparacion", titulo: "En preparación",     clase: "bg-blue-100 text-blue-800" },
  { estado: "lista",          titulo: "Listos para servir", clase: "bg-emerald-100 text-emerald-800" },
];

function TarjetaComanda({ c, cambiarEstado, cambiarItem }: {
  c: Comanda;
  cambiarEstado: (estado: EstadoComanda) => void;
  cambiarItem: (item: ItemComanda) => void;
}) {
  const min = minutosDesde(c.enviadaEn);
  const urgente = min > 15;

  return (
    <article className={`rounded-xl border bg-white p-3 shadow-sm ${urgente ? "border-2 border-red-400" : "border-slate-200"}`}>
      <header className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="text-base font-extrabold">#{c.numero}</span>
        <span className="text-xs text-slate-500">Mesa {c.mesa.numero}</span>
        <span className={`ml-auto text-xs font-semibold ${urgente ? "text-red-600" : "text-slate-400"}`}>
          {min}′
        </span>
      </header>

      <ul className="space-y-1.5">
        {c.items.map((item) => (
          <li key={item._id} className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="font-bold text-orange-600">{item.cantidad}×</span>
            <span className={`flex-1 ${item.estado === "listo" ? "text-slate-400 line-through" : ""}`}>
              {item.nombre}
            </span>
            {item.estado === "listo" ? (
              <span className="text-base">✅</span>
            ) : (
              c.estado === "en_preparacion" && (
                <Btn s="sm" v="secondary" onClick={() => cambiarItem(item)}>✓</Btn>
              )
            )}
            {item.notas && (
              <em className="w-full text-[11px] not-italic text-amber-700">📌 {item.notas}</em>
            )}
          </li>
        ))}
      </ul>

      {c.observaciones && (
        <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
          💬 {c.observaciones}
        </p>
      )}

      <footer className="mt-3">
        {c.estado === "pendiente" && (
          <Btn className="w-full" onClick={() => cambiarEstado("en_preparacion")}>
            Tomar pedido
          </Btn>
        )}
        {c.estado === "en_preparacion" && (
          <Btn className="w-full" onClick={() => cambiarEstado("lista")}>
            Marcar lista
          </Btn>
        )}
        {c.estado === "lista" && (
          <p className="text-center text-xs italic text-slate-400">Esperando al mozo...</p>
        )}
      </footer>
    </article>
  );
}

export function Cocina() {
  const { data: comandas = [], isLoading, error } = useComandas(true);
  const cambiarEstado = useCambiarEstadoComanda();
  const cambiarItem = useCambiarEstadoItem();
  const [mutError, setMutError] = useState<string | null>(null);

  const act = async (fn: () => Promise<unknown>) => {
    try { await fn(); setMutError(null); }
    catch (e) { setMutError((e as Error).message); }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMsg error={error} />;

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold">🍳 Cocina</h1>

      {mutError && <Alert tipo="error">{mutError}</Alert>}

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNAS.map((col) => {
          const lista = comandas.filter((c) => c.estado === col.estado);
          return (
            <section key={col.estado}>
              <h2 className={`mb-3 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${col.clase}`}>
                {col.titulo} ({lista.length})
              </h2>
              <div className="space-y-2.5">
                {lista.map((c) => (
                  <TarjetaComanda
                    key={c.id}
                    c={c}
                    cambiarEstado={(estado) =>
                      void act(() => cambiarEstado.mutateAsync({ id: c.id, estado }))
                    }
                    cambiarItem={(item) =>
                      void act(() =>
                        cambiarItem.mutateAsync({ comandaId: c.id, itemId: item._id, estado: "listo" })
                      )
                    }
                  />
                ))}
                {lista.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">
                    Sin comandas acá
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
