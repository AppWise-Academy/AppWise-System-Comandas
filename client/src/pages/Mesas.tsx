// ============================================================
// pages/Mesas.tsx — Mapa del salón en tiempo real
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMesas, useAbrirMesa, usePedirCuenta, useLiberarMesa } from "../hooks/queries";
import { useAuth } from "../hooks/useAuth";
import { Spinner, ErrorMsg, Empty, Alert } from "../components/ui/Feedback";
import { Btn } from "../components/ui/Btn";
import { minutosDesde } from "../lib";
import type { Mesa, Sector } from "../types";

const BORDE: Record<string, string> = {
  libre:     "border-emerald-300 bg-emerald-50/70",
  ocupada:   "border-red-300 bg-red-50/70",
  cuenta:    "border-amber-300 bg-amber-50/70",
  reservada: "border-violet-300 bg-violet-50/70",
};
const ICON: Record<string, string> = {
  libre: "🟢", ocupada: "🔴", cuenta: "💰", reservada: "📅",
};
const SECTOR_LABEL: Record<Sector, string> = {
  salon: "Salón", terraza: "Terraza", barra: "Barra", vip: "VIP",
};
const FILTROS = ["todas", "libre", "ocupada", "cuenta", "mias"] as const;
type Filtro = (typeof FILTROS)[number];

function TarjetaMesa({
  mesa, puedeOperar, onAbrir, onCuenta, onLiberar, onPedido,
}: {
  mesa: Mesa;
  puedeOperar: boolean;
  onAbrir: (m: Mesa) => void;
  onCuenta: (id: string) => void;
  onLiberar: (id: string) => void;
  onPedido: (id: string) => void;
}) {
  return (
    <div className={`rounded-xl border-2 p-3 text-center shadow-sm transition-all ${BORDE[mesa.estado]}`}>
      <div className="text-4xl font-extrabold leading-none">{mesa.numero}</div>
      <div className="mt-1 text-xs font-semibold capitalize">
        {ICON[mesa.estado]} {mesa.estado === "cuenta" ? "Pidió cuenta" : mesa.estado}
      </div>
      <div className="mt-0.5 text-[11px] text-slate-500">
        👥 {mesa.capacidad}{mesa.comensales > 0 && ` · ${mesa.comensales} en mesa`}
      </div>
      {mesa.mozo && <div className="text-[11px] text-slate-500">🧑‍🍳 {mesa.mozo.nombre}</div>}
      {mesa.abiertaEn && (
        <div className="text-[11px] text-slate-400">⏱️ {minutosDesde(mesa.abiertaEn)} min</div>
      )}

      {puedeOperar && (
        <div className="mt-3 flex flex-wrap justify-center gap-1">
          {mesa.estado === "libre" ? (
            <Btn s="sm" onClick={() => onAbrir(mesa)}>Abrir</Btn>
          ) : (
            <>
              <Btn s="sm" onClick={() => onPedido(mesa.id)}>Pedido</Btn>
              {mesa.estado === "ocupada" && (
                <Btn s="sm" v="secondary" onClick={() => onCuenta(mesa.id)}>Cuenta</Btn>
              )}
              <Btn s="sm" v="secondary" onClick={() => onLiberar(mesa.id)}>Liberar</Btn>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Mesas() {
  const { data: mesas, isLoading, error, refetch } = useMesas();
  const abrir = useAbrirMesa();
  const cuenta = usePedirCuenta();
  const liberar = useLiberarMesa();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [mutError, setMutError] = useState<string | null>(null);

  const puedeOperar = usuario?.rol === "mozo" || usuario?.rol === "admin";

  const act = async (fn: () => Promise<unknown>) => {
    try { await fn(); setMutError(null); }
    catch (e) { setMutError((e as Error).message); }
  };

  const onAbrir = (mesa: Mesa) => {
    const c = prompt(`¿Cuántas personas en la mesa ${mesa.numero}?`, "2");
    if (!c) return;
    void act(() => abrir.mutateAsync({ id: mesa.id, comensales: Number(c) }));
  };

  const visibles = (mesas ?? []).filter((m) => {
    if (filtro === "todas") return true;
    if (filtro === "mias") return m.mozo?.id === usuario?.id;
    return m.estado === filtro;
  });

  const porSector = visibles.reduce<Record<string, Mesa[]>>((acc, m) => {
    (acc[m.sector] ??= []).push(m);
    return acc;
  }, {});

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMsg error={error} />;

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">🪑 Salón</h1>
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filtro === f
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f === "mias" ? "Mis mesas" : f}
            </button>
          ))}
          <Btn s="sm" v="secondary" onClick={() => void refetch()}>↻ Actualizar</Btn>
        </div>
      </div>

      {mutError && <Alert tipo="error">{mutError}</Alert>}

      {/* Grilla por sector */}
      {Object.entries(porSector).map(([sector, lista]) => (
        <section key={sector} className="mb-6">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            {SECTOR_LABEL[sector as Sector] ?? sector}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {lista.map((mesa) => (
              <TarjetaMesa
                key={mesa.id}
                mesa={mesa}
                puedeOperar={puedeOperar}
                onAbrir={onAbrir}
                onCuenta={(id) => void act(() => cuenta.mutateAsync(id))}
                onLiberar={(id) => void act(() => liberar.mutateAsync(id))}
                onPedido={(id) => navigate(`/comanda/nueva/${id}`)}
              />
            ))}
          </div>
        </section>
      ))}

      {visibles.length === 0 && <Empty>No hay mesas con ese filtro.</Empty>}
    </div>
  );
}
