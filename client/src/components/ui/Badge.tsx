import type { EstadoComanda, EstadoMesa, Rol } from "../../types";

const BASE = "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset";

const EC: Record<EstadoComanda, string> = {
  pendiente:      "bg-amber-100 text-amber-800 ring-amber-200",
  en_preparacion: "bg-blue-100 text-blue-800 ring-blue-200",
  lista:          "bg-emerald-100 text-emerald-800 ring-emerald-200",
  entregada:      "bg-slate-100 text-slate-700 ring-slate-200",
  pagada:         "bg-violet-100 text-violet-800 ring-violet-200",
  cancelada:      "bg-red-100 text-red-800 ring-red-200",
};
const EC_TEXTO: Record<EstadoComanda, string> = {
  pendiente: "Pendiente", en_preparacion: "En preparación", lista: "¡Lista!",
  entregada: "Entregada", pagada: "Pagada", cancelada: "Cancelada",
};

const EM: Record<EstadoMesa, string> = {
  libre:     "bg-emerald-100 text-emerald-800 ring-emerald-200",
  ocupada:   "bg-red-100 text-red-800 ring-red-200",
  cuenta:    "bg-amber-100 text-amber-800 ring-amber-200",
  reservada: "bg-violet-100 text-violet-800 ring-violet-200",
};
const EM_TEXTO: Record<EstadoMesa, string> = {
  libre: "Libre", ocupada: "Ocupada", cuenta: "Cuenta", reservada: "Reservada",
};

const RL: Record<Rol, string> = {
  admin:  "bg-amber-100 text-amber-800 ring-amber-200",
  mozo:   "bg-blue-100 text-blue-800 ring-blue-200",
  cocina: "bg-red-100 text-red-800 ring-red-200",
  cajero: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export function BadgeEstado({ estado }: { estado: EstadoComanda }) {
  return <span className={`${BASE} ${EC[estado]}`}>{EC_TEXTO[estado]}</span>;
}
export function BadgeMesa({ estado }: { estado: EstadoMesa }) {
  return <span className={`${BASE} ${EM[estado]}`}>{EM_TEXTO[estado]}</span>;
}
export function BadgeRol({ rol }: { rol: Rol }) {
  return <span className={`${BASE} ${RL[rol]}`}>{rol}</span>;
}
