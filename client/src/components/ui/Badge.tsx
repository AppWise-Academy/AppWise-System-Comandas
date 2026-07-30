import type { ReactNode } from "react";
import type { EstadoComanda, Rol, EstadoMesa } from "../../types";

const ESTADO_COMANDA: Record<EstadoComanda, { texto: string; clase: string }> = {
  pendiente:      { texto: "Pendiente",      clase: "bg-amber-100 text-amber-800 ring-amber-200" },
  en_preparacion: { texto: "En preparación", clase: "bg-blue-100 text-blue-800 ring-blue-200" },
  lista:          { texto: "¡Lista!",        clase: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  entregada:      { texto: "Entregada",      clase: "bg-slate-100 text-slate-700 ring-slate-200" },
  pagada:         { texto: "Pagada",         clase: "bg-violet-100 text-violet-800 ring-violet-200" },
  cancelada:      { texto: "Cancelada",      clase: "bg-red-100 text-red-800 ring-red-200" },
};

const ROL: Record<Rol, { texto: string; clase: string }> = {
  admin:  { texto: "admin",  clase: "bg-amber-100 text-amber-800 ring-amber-200" },
  mozo:   { texto: "mozo",   clase: "bg-blue-100 text-blue-800 ring-blue-200" },
  cocina: { texto: "cocina", clase: "bg-red-100 text-red-800 ring-red-200" },
  cajero: { texto: "cajero", clase: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
};

const ESTADO_MESA: Record<EstadoMesa, { texto: string; clase: string }> = {
  libre:     { texto: "Libre",        clase: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  ocupada:   { texto: "Ocupada",      clase: "bg-red-100 text-red-800 ring-red-200" },
  cuenta:    { texto: "Pidió cuenta", clase: "bg-amber-100 text-amber-800 ring-amber-200" },
  reservada: { texto: "Reservada",    clase: "bg-violet-100 text-violet-800 ring-violet-200" },
};

const BASE = "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset";

export function BadgeEstado({ estado }: { estado: EstadoComanda }) {
  const e = ESTADO_COMANDA[estado];
  return <span className={`${BASE} ${e.clase}`}>{e.texto}</span>;
}

export function BadgeRol({ rol }: { rol: Rol }) {
  const r = ROL[rol];
  return <span className={`${BASE} ${r.clase}`}>{r.texto}</span>;
}

export function BadgeMesa({ estado }: { estado: EstadoMesa }) {
  const m = ESTADO_MESA[estado];
  return <span className={`${BASE} ${m.clase}`}>{m.texto}</span>;
}

export function Badge({ children, clase = "bg-slate-100 text-slate-700 ring-slate-200" }: { children: ReactNode; clase?: string }) {
  return <span className={`${BASE} ${clase}`}>{children}</span>;
}
