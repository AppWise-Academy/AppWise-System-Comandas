import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";
type Tamano = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  children: ReactNode;
}

const VARIANTES: Record<Variante, string> = {
  primario: "bg-marca-600 text-white hover:bg-marca-700 shadow-sm",
  secundario:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  peligro: "bg-red-600 text-white hover:bg-red-700",
  fantasma: "text-slate-600 hover:bg-slate-100",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export function Boton({
  variante = "primario",
  tamano = "md",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-marca-500 focus:ring-offset-1
        ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
    >
      {children}
    </button>
  );
}
