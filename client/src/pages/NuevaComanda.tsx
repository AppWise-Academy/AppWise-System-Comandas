// ============================================================
// pages/NuevaComanda.tsx — El mozo arma el pedido
// ============================================================

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCarta, useMesa, useCrearComanda } from "../hooks/queries";
import { Spinner, Alert, Empty } from "../components/ui/Feedback";
import { Btn } from "../components/ui/Btn";
import { plata } from "../lib";
import type { Producto } from "../types";

interface ItemPedido {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  notas: string;
}

export function NuevaComanda() {
  const { mesaId = "" } = useParams();
  const navigate = useNavigate();

  const { data: carta, isLoading: cargandoCarta } = useCarta();
  const { data: mesa, isLoading: cargandoMesa } = useMesa(mesaId);
  const crear = useCrearComanda();

  const [catActiva, setCatActiva] = useState<string | null>(null);
  const [pedido, setPedido] = useState<ItemPedido[]>([]);
  const [observaciones, setObservaciones] = useState("");
  const [mutError, setMutError] = useState<string | null>(null);

  if (cargandoCarta || cargandoMesa) return <Spinner />;

  const categoria = carta?.find((c) => c.id === (catActiva ?? carta[0]?.id));
  const catId = catActiva ?? carta?.[0]?.id;

  const agregar = (p: Producto) =>
    setPedido((prev) => {
      const ex = prev.find((i) => i.productoId === p.id);
      if (ex) return prev.map((i) => i.productoId === p.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { productoId: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1, notas: "" }];
    });

  const cambiarCantidad = (id: string, delta: number) =>
    setPedido((prev) =>
      prev.map((i) => i.productoId === id ? { ...i, cantidad: i.cantidad + delta } : i)
          .filter((i) => i.cantidad > 0)
    );

  const total = pedido.reduce((s, i) => s + i.precio * i.cantidad, 0);

  const enviar = async () => {
    setMutError(null);
    try {
      await crear.mutateAsync({
        mesaId,
        items: pedido.map(({ productoId, cantidad, notas }) => ({ productoId, cantidad, notas })),
        observaciones,
      });
      navigate("/comandas");
    } catch (e) {
      setMutError((e as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          📝 Nuevo pedido{mesa && <span className="ml-2 text-slate-400">· Mesa {mesa.numero}</span>}
        </h1>
        <Btn v="secondary" onClick={() => navigate("/mesas")}>← Volver al salón</Btn>
      </div>

      {mutError && <Alert tipo="error">{mutError}</Alert>}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Carta */}
        <section>
          {/* Tabs de categoría */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {carta?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatActiva(cat.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  catId === cat.id
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat.icono} {cat.nombre}
              </button>
            ))}
          </div>

          {/* Productos */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categoria?.productos.map((p) => (
              <button
                key={p.id}
                onClick={() => agregar(p)}
                className="group rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md"
              >
                <div className="text-sm font-semibold leading-snug group-hover:text-orange-600">
                  {p.nombre}
                </div>
                {p.descripcion && (
                  <div className="mt-0.5 text-[11px] leading-tight text-slate-400">{p.descripcion}</div>
                )}
                <div className="mt-2 flex items-end justify-between">
                  <span className="font-bold text-orange-600">{plata(p.precio)}</span>
                  <span className="text-[10px] text-slate-400">⏱️ {p.tiempoPreparacion}′</span>
                </div>
              </button>
            ))}
            {categoria?.productos.length === 0 && (
              <Empty>Sin productos disponibles en esta categoría.</Empty>
            )}
          </div>
        </section>

        {/* Pedido armado */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-bold">Pedido</h3>

            {pedido.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Tocá un plato para agregarlo</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {pedido.map((item) => (
                  <li key={item.productoId} className="border-b border-slate-100 pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-sm">{item.nombre}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => cambiarCantidad(item.productoId, -1)}
                          className="h-6 w-6 rounded-md bg-slate-200 text-sm font-bold leading-none hover:bg-slate-300"
                        >−</button>
                        <span className="w-4 text-center text-sm font-semibold">{item.cantidad}</span>
                        <button
                          onClick={() => cambiarCantidad(item.productoId, 1)}
                          className="h-6 w-6 rounded-md bg-slate-200 text-sm font-bold leading-none hover:bg-slate-300"
                        >+</button>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      {plata(item.precio * item.cantidad)}
                    </div>
                    <input
                      value={item.notas}
                      onChange={(e) =>
                        setPedido((prev) =>
                          prev.map((i) =>
                            i.productoId === item.productoId ? { ...i, notas: e.target.value } : i
                          )
                        )
                      }
                      placeholder="Sin sal, jugoso..."
                      maxLength={200}
                      className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-orange-400 focus:outline-none"
                    />
                  </li>
                ))}
              </ul>
            )}

            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones generales..."
              rows={2}
              maxLength={300}
              className="mt-3 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-orange-400 focus:outline-none"
            />

            <div className="mt-3 flex items-center justify-between border-t-2 border-slate-100 pt-3">
              <span className="text-sm text-slate-500">Total</span>
              <strong className="text-2xl font-extrabold text-orange-600">{plata(total)}</strong>
            </div>

            <Btn
              onClick={enviar}
              disabled={crear.isPending || pedido.length === 0}
              s="lg"
              className="mt-3 w-full"
            >
              {crear.isPending ? "Enviando..." : "🍳 Enviar a cocina"}
            </Btn>
          </div>
        </aside>
      </div>
    </div>
  );
}
