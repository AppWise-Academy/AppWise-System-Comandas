import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { useAuthStore } from "../store/authStore";
import { Card, CardStat } from "../components/ui/Card";
import { Boton } from "../components/ui/Boton";
import type {
  ErrorApi,
  Producto,
  StatsComandas,
  StatsMesas,
  UserInterface,
} from "../types";
import { Alert } from "../components/ui/Alert";
import { BadgeRol } from "../components/ui/Badge";

const TABS = ["resumen", "usuarios", "menu"] as const;
type Tab = (typeof TABS)[number];

export const plata = (n: number) => `$${n.toLocaleString("es-AR")}`;

export function Admin() {
  const yo = useAuthStore();
  const [tab, setTab] = useState<Tab>("resumen");
  const [statsC, setStatsC] = useState<StatsComandas | null>(null);
  const [statsM, setStatsM] = useState<StatsMesas | null>(null);
  const [top, setTop] = useState<Producto[]>([]);
  const [usuarios, setUsuarios] = useState<UserInterface[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);

  // const cargar = useCallback(async () => {
  //   try {
  //     const [sc, sm, mv, us, pr] = await Promise.all([
  //       api.statsComandas(),
  //       api.statsMesas(),
  //       api.masVendidos(),
  //       api.listarUsuarios(),
  //       api.listarProductos(),
  //     ]);
  //     setStatsC(sc);
  //     setStatsM(sm);
  //     setTop(mv);
  //     setUsuarios(us);
  //     setProductos(pr);
  //     setError(null);
  //   } catch (e) {
  //     setError((e as ErrorApi).message);
  //   }
  // }, []);

  // const accion = async (fn: () => Promise<unknown>) => {
  //   try {
  //     await fn();
  //     await cargar();
  //   } catch (e) {
  //     setError((e as ErrorApi).message);
  //   }
  // };

  const cambiarRol = (u: UserInterface) => {
    const rol = prompt(
      `Nuevo rol para ${u.name} (admin, mozo, cocina, cajero)`,
      u.rol,
    );
    if (!rol) return;
    // void accion(() => api.cambiarRol(u.id, rol.trim() as Rol));
  };

  const th =
    "px-2 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400";
  const td = "px-2 py-2 text-sm border-t border-slate-100";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">📊 Panel del encargado</h2>
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                tab === t
                  ? "border-marca-500 bg-marca-500 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {tab === "resumen" && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <CardStat
              icono="💰"
              valor={plata(statsC?.ventasHoy ?? 0)}
              etiqueta="Ventas de hoy"
            />
            <CardStat
              icono="🧾"
              valor={statsC?.comandasHoy ?? "—"}
              etiqueta="Comandas hoy"
            />
            <CardStat
              icono="🎫"
              valor={plata(statsC?.ticketPromedio ?? 0)}
              etiqueta="Ticket promedio"
            />
            <CardStat
              icono="⏱️"
              valor={`${statsC?.tiempoPromedioPreparacion ?? 0}′`}
              etiqueta="Tiempo cocina"
            />
            <CardStat
              icono="📈"
              valor={`${statsM?.ocupacion ?? 0}%`}
              etiqueta="Ocupación"
            />
            <CardStat
              icono="🪑"
              valor={statsM?.libres ?? "—"}
              etiqueta="Mesas libres"
            />
          </div>

          <Card>
            <h3 className="mb-3 font-bold">🏆 Más vendidos</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>#</th>
                  <th className={th}>Producto</th>
                  <th className={th}>Categoría</th>
                  <th className={th}>Vendidos</th>
                </tr>
              </thead>
              <tbody>
                {top.map((p, i) => (
                  <tr key={p.id}>
                    <td className={td}>{i + 1}</td>
                    <td className={td}>{p.nombre}</td>
                    <td className={td}>
                      {typeof p.categoria === "object"
                        ? `${p.categoria.icono} ${p.categoria.nombre}`
                        : "—"}
                    </td>
                    <td className={`${td} font-bold`}>{p.vecesVendido}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === "usuarios" && (
        <Card>
          <h3 className="mb-3 font-bold">Empleados</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>Nombre</th>
                  <th className={th}>Email</th>
                  <th className={th}>Rol</th>
                  <th className={th}>Estado</th>
                  <th className={th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className={u.isActive ? "" : "opacity-50"}>
                    <td className={td}>{u.name}</td>
                    <td className={`${td} font-mono text-xs`}>{u.email}</td>
                    <td className={td}>
                      <BadgeRol rol={u.rol} />
                    </td>
                    <td className={td}>{u.isActive ? "✅" : "🚫"}</td>
                    <td className={td}>
                      {u.id !== yo?.user?.id ? (
                        <div className="flex gap-1">
                          <Boton
                            tamano="sm"
                            variante="secundario"
                            onClick={() => cambiarRol(u)}
                          >
                            Rol
                          </Boton>
                          <Boton
                            tamano="sm"
                            variante="secundario"
                            onClick={
                              () => {}
                              // void accion(() => api.alternarActivo(u.id))
                            }
                          >
                            {u.isActive ? "Suspender" : "Activar"}
                          </Boton>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400">
                          (vos)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "menu" && (
        <Card>
          <h3 className="mb-3 font-bold">Carta</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>Producto</th>
                  <th className={th}>Categoría</th>
                  <th className={th}>Precio</th>
                  <th className={th}>Vendidos</th>
                  <th className={th}>Disponible</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className={p.disponible ? "" : "opacity-50"}>
                    <td className={td}>{p.nombre}</td>
                    <td className={td}>
                      {typeof p.categoria === "object"
                        ? `${p.categoria.icono} ${p.categoria.nombre}`
                        : "—"}
                    </td>
                    <td className={td}>{plata(p.precio)}</td>
                    <td className={td}>{p.vecesVendido}</td>
                    <td className={td}>
                      <Boton
                        tamano="sm"
                        variante="secundario"
                        onClick={
                          () => {}
                          // void accion(() => api.alternarDisponible(p.id))
                        }
                      >
                        {p.disponible ? "✅ Sí" : "🚫 Sin stock"}
                      </Boton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
