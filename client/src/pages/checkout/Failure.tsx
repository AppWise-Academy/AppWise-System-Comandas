// ============================================================
// pages/checkout/Failure.tsx
// ------------------------------------------------------------
// back_url "failure": Mercado Pago redirige acá cuando el pago fue
// rechazado (tarjeta sin fondos, datos inválidos, etc) o el usuario
// canceló el Checkout. Igual que Success.tsx, es solo una pantalla de
// feedback — no dispara ninguna lógica de negocio por sí sola.
// ============================================================

import { Link } from "react-router-dom";
import { Btn } from "../../components/ui/Btn";

export function Failure() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <div className="text-6xl">❌</div>
      <h1 className="text-xl font-bold">El pago no se pudo procesar</h1>
      <p className="text-sm text-slate-500">
        Mercado Pago rechazó el pago o lo cancelaste. No se realizó ningún cobro. Podés
        intentarlo de nuevo desde la Caja.
      </p>
      <Link to="/caja">
        <Btn className="mt-4">Volver a la Caja</Btn>
      </Link>
    </div>
  );
}
