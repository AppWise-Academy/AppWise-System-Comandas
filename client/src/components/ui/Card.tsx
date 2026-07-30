import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardStat({ valor, etiqueta, icono }: { valor: string | number; etiqueta: string; icono?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      {icono && <div className="text-xl">{icono}</div>}
      <div className="text-2xl font-extrabold text-marca-600">{valor}</div>
      <div className="text-xs text-slate-500">{etiqueta}</div>
    </div>
  );
}
