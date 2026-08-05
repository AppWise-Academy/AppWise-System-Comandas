// ============================================================
// components/RolGuard.tsx
// ⚠️ Solo es UX — la seguridad REAL la pone el backend con roleGuard.
// ============================================================

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Rol } from "../types";

interface Props {
  roles?: Rol[];
  children: ReactNode;
}

export function RolGuard({ roles = [], children }: Props) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(usuario.rol)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="text-5xl">🚫</div>
        <h2 className="text-xl font-bold">403 — Acceso denegado</h2>
        <p className="text-sm text-slate-500">
          Tu rol es <strong>{usuario.rol}</strong> y esta sección es para:{" "}
          <strong>{roles.join(", ")}</strong>.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
