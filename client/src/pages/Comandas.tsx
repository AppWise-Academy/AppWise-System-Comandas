// ============================================================
// pages/Comandas.tsx — Vista de mozos y cajeros
// ============================================================

import { useState } from "react";
import { useComandas, useCambiarEstadoComanda, useCobrar } from "../hooks/queries";
import { useAuth } from "../hooks/useAuth";
import { Spinner, ErrorMsg, Alert, Empty } from "../components/ui/Feedback";
import { BadgeEstado } from "../components/ui/Badge";
import { Btn } from "../components/ui/Btn";
import { Modal } from "../components/ui/Modal";
import { plata, hora } from "../lib";
import type { Comanda, EstadoComanda, MetodoPago } from "../types";

const BORDE: Record<EstadoComanda, string> = {
  pendiente:      "border-l-amber-400",
  en_preparacion: "border-l-blue-400",
  lista:          "border-l-emerald-500 bg-emerald-50/40",
  entregada:      "border-l-slate-400",
  pagada:         "border-l-violet-400 opacity-70",
  cancelada:      "border-l-red-400 opacity-60",
};

export function Comandas() {
  const { usuario } = useAuth();
  const [verTodas, setVerTodas] = useState(false);
  const { data: comandas = [], isLoading, error } = useComandas(!verTodas);
  const cambiarEstado = useCambiarEstadoComanda();
  const cobrar = useCobrar();

  const [mutError, setMutError] = useState<string | null>(null);
  const [cobrando, setCobrando] = useState<Comanda | null>(null);

  const esMozo = usuario?.rol === "mozo" || usuario?.rol === "admin";
  const esCaja = usuario?.rol === "cajero" || usuario?.rol === "admin";

  const act = async (fn: () => Promise<unknown>) => {
    try { await fn(); setMutError(null); }
    catch (e) { setMutError((e as Error).message); }
  };

  const pagar = async (metodo: MetodoPago) => {
    if (!cobrando) return;
    await act(() => cobrar.mutateAsync({ id: cobrando.id, metodoPago: metodo }));
    setCobrando(null);
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMsg error={error} />;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">🧾 Comandas</h1>
        <Btn v="secondary" onClick={() => setVerTodas((v) => !v)}>
          {verTodas ? "Solo activas" : "Ver todas las de hoy"}
        </Btn>
      </div>

      {mutError && <Alert tipo="error">{mutError}</Alert>}

      {comandas.length === 0 ? (
        <Empty>No hay comandas para mostrar.</Empty>
      ) : (
        <div className="space-y-3">
          {comandas.map((c) => (
            <article
              key={c.id}
              className={`rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm ${BORDE[c.estado]}`}
            >
              <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
                <span className="text-base font-extrabold">#{c.numero}</span>
                <span className="text-sm text-slate-500">Mesa {c.mesa.numero}</span>
                <BadgeEstado estado={c.estado} />
                <span className="text-xs text-slate-400">🧑‍🍳 {c.mozo.nombre}</span>
                <span className="text-xs text-slate-400">{hora(c.enviadaEn)}</span>
                <strong className="ml-auto text-lg">{plata(c.total)}</strong>
              </div>

              <ul className="mb-2.5 space-y-0.5 text-sm text-slate-600">
                {c.items.map((i) => (
                  <li key={i._id} className={i.estado === "cancelado" ? "line-through opacity-50" : ""}>
                    {i.cantidad}× {i.nombre}
                    {i.notas && <em className="text-xs not-italic text-amber-700"> — {i.notas}</em>}
                    {i.estado === "listo" && " ✅"}
                  </li>
                ))}
              </ul>

              {c.observaciones && (
                <p className="mb-2 text-xs text-amber-700">📝 {c.observaciones}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {esMozo && c.estado === "lista" && (
                  <Btn s="sm" onClick={() => void act(() => cambiarEstado.mutateAsync({ id: c.id, estado: "entregada" }))}>
                    Marcar entregada
                  </Btn>
                )}
                {esCaja && c.estado === "entregada" && (
                  <Btn s="sm" onClick={() => setCobrando(c)}>💵 Cobrar</Btn>
                )}
                {esMozo && ["pendiente", "en_preparacion"].includes(c.estado) && (
                  <Btn s="sm" v="secondary" onClick={() => void act(() => cambiarEstado.mutateAsync({ id: c.id, estado: "cancelada" }))}>
                    Cancelar
                  </Btn>
                )}
                {c.metodoPago && (
                  <span className="text-xs italic text-slate-400">Pagó con {c.metodoPago}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de cobro */}
      {cobrando && (
        <Modal onClose={() => setCobrando(null)}>
          <h3 className="mb-1 font-bold">Cobrar comanda #{cobrando.numero}</h3>
          <p className="mb-5 text-3xl font-extrabold text-orange-600">{plata(cobrando.total)}</p>
          <div className="space-y-2">
            {(["efectivo", "tarjeta", "transferencia"] as MetodoPago[]).map((m) => (
              <Btn key={m} className="w-full capitalize" onClick={() => void pagar(m)}>
                {m}
              </Btn>
            ))}
            <Btn v="secondary" className="w-full" onClick={() => setCobrando(null)}>
              Cancelar
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
