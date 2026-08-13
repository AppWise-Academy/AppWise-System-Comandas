// ============================================================
// pages/checkout/Pending.tsx
// ------------------------------------------------------------
// back_url "pending": Mercado Pago redirige acá con medios de pago que no
// se acreditan al instante (efectivo en rapipago/pagofácil, transferencia,
// etc). El pago puede aprobarse horas/días después. Por eso NUNCA se usa
// `auto_return` en este caso (ver preference.body.auto_return en
// payment.service.js): el usuario tiene que ver esta pantalla sí o sí.
// La confirmación real, cuando llegue, sigue viajando por el webhook.
// ============================================================

import { Link } from "react-router-dom";
import { Btn } from "../../components/ui/Btn";

export function Pending() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <div className="text-6xl">⏳</div>
      <h1 className="text-xl font-bold">Pago pendiente</h1>
      <p className="text-sm text-slate-500">
        Tu pago está siendo procesado (medios de pago como efectivo o transferencia tardan en
        acreditarse). En cuanto Mercado Pago lo confirme, la caja se va a actualizar sola.
      </p>
      <Link to="/caja">
        <Btn className="mt-4">Volver a la Caja</Btn>
      </Link>
    </div>
  );
}
