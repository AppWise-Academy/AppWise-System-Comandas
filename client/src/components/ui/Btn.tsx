import type { ButtonHTMLAttributes, ReactNode } from "react";

type V = "primary" | "secondary" | "danger" | "ghost";
type S = "sm" | "md" | "lg";

const V_CLS: Record<V, string> = {
  primary:   "bg-orange-600 text-white hover:bg-orange-700 shadow-sm",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  danger:    "bg-red-600 text-white hover:bg-red-700",
  ghost:     "text-slate-600 hover:bg-slate-100",
};
const S_CLS: Record<S, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-1.5 text-sm",
  lg: "px-5 py-2.5 text-base",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  v?: V; s?: S; children: ReactNode;
}

export function Btn({ v = "primary", s = "md", className = "", children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${V_CLS[v]} ${S_CLS[s]} ${className}`}
    >
      {children}
    </button>
  );
}
