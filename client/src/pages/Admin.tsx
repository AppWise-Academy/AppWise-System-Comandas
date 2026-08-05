// ============================================================
// pages/Admin.tsx — Panel del encargado
// ============================================================

import { useState } from "react";
import {
  useStatsComandas, useStatsMesas, useMasVendidos,
  useUsuarios, useProductos, useCambiarRol, useToggleActivo, useToggleDisponible,
} from "../hooks/queries";
import { useAuth } from "../hooks/useAuth";
import { Spinner, ErrorMsg, Alert } from "../components/ui/Feedback";
import { Card, Stat } from "../components/ui/Card";
import { Btn } from "../components/ui/Btn";
import { BadgeRol } from "../components/ui/Badge";
import { plata } from "../lib";
import type { Rol } from "../types";

const TABS = ["resumen", "usuarios", "menu"] as const;
type Tab = (typeof TABS)[number];

const TH = "px-2 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400";
const TD = "px-2 py-2.5 text-sm border-t border-slate-100";

export function Admin() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState<Tab>("resumen");
  const [mutError, setMutError] = useState<string | null>(null);

  const statsC = useStatsComandas();
  const statsM = useStatsMesas();
  const top     = useMasVendidos();
  const users   = useUsuarios();
  const prods   = useProductos();
  const cambiarRol   = useCambiarRol();
  const toggleActivo = useToggleActivo();
  const toggleDisp   = useToggleDisponible();

  const act = async (fn: () => Promise<unknown>) => {
    try { await fn(); setMutError(null); }
    catch (e) { setMutError((e as Error).message); }
  };

  const onCambiarRol = (id: string, nombreUsuario: string, rolActual: Rol) => {
    const rol = prompt(`Nuevo rol para ${nombreUsuario} (admin, mozo, cocina, cajero)`, rolActual) as Rol | null;
    if (!rol) return;
    void act(() => cambiarRol.mutateAsync({ id, rol }));
  };

  const loading = statsC.isLoading || statsM.isLoading || top.isLoading;
  const err = statsC.error ?? statsM.error ?? top.error;

  if (loading) return <Spinner />;
  if (err) return <ErrorMsg error={err} />;

  const sc = statsC.data!;
  const sm = statsM.data!;

  return (
    <div>
      {/* Cabecera + tabs */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">📊 Panel del encargado</h1>
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                tab === t
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {mutError && <Alert tipo="error">{mutError}</Alert>}

      {/* ── Resumen ── */}
      {tab === "resumen" && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat icon="💰" valor={plata(sc.ventasHoy)}            label="Ventas de hoy" />
            <Stat icon="🧾" valor={sc.comandasHoy}                 label="Comandas hoy" />
            <Stat icon="🎫" valor={plata(sc.ticketPromedio)}        label="Ticket promedio" />
            <Stat icon="⏱️" valor={`${sc.tiempoPromedioPreparacion}′`} label="Tiempo cocina" />
            <Stat icon="📈" valor={`${sm.ocupacion}%`}             label="Ocupación" />
            <Stat icon="🪑" valor={sm.libres}                      label="Mesas libres" />
          </div>

          <Card>
            <h2 className="mb-3 font-bold">🏆 Más pedidos</h2>
            {top.isLoading ? <Spinner /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr><th className={TH}>#</th><th className={TH}>Producto</th><th className={TH}>Categoría</th><th className={TH}>Precio</th><th className={TH}>Pedidos</th></tr>
                  </thead>
                  <tbody>
                    {top.data?.map((p, i) => (
                      <tr key={p.id}>
                        <td className={TD}>{i + 1}</td>
                        <td className={TD}>{p.nombre}</td>
                        <td className={TD}>{p.categoria.icono} {p.categoria.nombre}</td>
                        <td className={TD}>{plata(p.precio)}</td>
                        <td className={`${TD} font-bold text-orange-600`}>{p.vecesVendido}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* ── Usuarios ── */}
      {tab === "usuarios" && (
        <Card>
          <h2 className="mb-3 font-bold">Empleados</h2>
          {users.isLoading ? <Spinner /> : users.error ? <ErrorMsg error={users.error} /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={TH}>Nombre</th><th className={TH}>Email</th>
                    <th className={TH}>Rol</th><th className={TH}>Estado</th><th className={TH}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data?.map((u) => (
                    <tr key={u.id} className={u.activo ? "" : "opacity-50"}>
                      <td className={TD}>{u.nombre}</td>
                      <td className={`${TD} font-mono text-xs`}>{u.email}</td>
                      <td className={TD}><BadgeRol rol={u.rol} /></td>
                      <td className={TD}>{u.activo ? "✅" : "🚫"}</td>
                      <td className={TD}>
                        {u.id !== usuario?.id ? (
                          <div className="flex gap-1.5">
                            <Btn s="sm" v="secondary" onClick={() => onCambiarRol(u.id, u.nombre, u.rol)}>
                              Cambiar rol
                            </Btn>
                            <Btn s="sm" v="secondary" onClick={() => void act(() => toggleActivo.mutateAsync(u.id))}>
                              {u.activo ? "Suspender" : "Activar"}
                            </Btn>
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">(vos)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── Menú ── */}
      {tab === "menu" && (
        <Card>
          <h2 className="mb-3 font-bold">Carta</h2>
          {prods.isLoading ? <Spinner /> : prods.error ? <ErrorMsg error={prods.error} /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={TH}>Producto</th><th className={TH}>Categoría</th>
                    <th className={TH}>Precio</th><th className={TH}>Vendidos</th><th className={TH}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {prods.data?.map((p) => (
                    <tr key={p.id} className={p.disponible ? "" : "opacity-50"}>
                      <td className={TD}>{p.nombre}</td>
                      <td className={TD}>{p.categoria.icono} {p.categoria.nombre}</td>
                      <td className={TD}>{plata(p.precio)}</td>
                      <td className={TD}>{p.vecesVendido}</td>
                      <td className={TD}>
                        <Btn s="sm" v={p.disponible ? "secondary" : "primary"} onClick={() => void act(() => toggleDisp.mutateAsync(p.id))}>
                          {p.disponible ? "✅ Disponible" : "🚫 Sin stock"}
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
