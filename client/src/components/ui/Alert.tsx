import type { ReactNode } from "react";

type Tipo = "error" | "ok" | "info";

const ESTILOS: Record<Tipo, string> = {
  error: "bg-red-50 text-red-800 border-red-200",
  ok: "bg-emerald-50 text-emerald-800 border-emerald-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

export function Alert({
  tipo = "error",
  children,
}: {
  tipo?: Tipo;
  children: ReactNode;
}) {
  return (
    <div
      className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${ESTILOS[tipo]}`}
    >
      {children}
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-slate-400">{children}</p>;
}

export function Cargando({
  children = "Cargando...",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-marca-500" />
      <span className="text-sm">{children}</span>
    </div>
  );
}
