import type { ReactNode } from "react";

export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" />
      <span className="text-sm">Cargando...</span>
    </div>
  );
}

export function ErrorMsg({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      ❌ {error.message}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-sm text-slate-400">{children}</p>;
}

export function Alert({
  children, tipo = "error",
}: { children: ReactNode; tipo?: "error" | "ok" | "warn" }) {
  const CLS = { error: "bg-red-50 text-red-800 border-red-200", ok: "bg-emerald-50 text-emerald-800 border-emerald-200", warn: "bg-amber-50 text-amber-800 border-amber-200" };
  return <div className={`mb-3 rounded-lg border px-4 py-2.5 text-sm ${CLS[tipo]}`}>{children}</div>;
}
