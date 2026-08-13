// ============================================================
// pages/checkout/Success.tsx
// ------------------------------------------------------------
// A esta pantalla te trae Mercado Pago cuando redirige el navegador del
// cliente después de un pago aprobado (una de las 3 `back_urls` que
// mandamos al crear la preferencia — ver payment.service.js).
//
// 🎓 Punto clave para remarcar en clase: esta pantalla es SOLO estética
// ("gracias por tu pago"). NO es acá donde confirmamos que el pago sea
// legítimo ni donde actualizamos la mesa/comanda como pagada — eso YA
// pasó (o está pasando) del lado del backend, vía el webhook, que es un
// canal servidor-a-servidor mucho más confiable que "el navegador me
// redirigió para acá" (un usuario mal intencionado podría entrar a esta
// URL a mano sin haber pagado nada).
//
// Mercado Pago agrega varios parámetros a la URL de éxito por query
// string: los leemos acá solo para MOSTRAR feedback, nunca para decidir
// lógica de negocio.
// ============================================================

import { Link, useSearchParams } from "react-router-dom";
import { Btn } from "../../components/ui/Btn";

export function Success() {
  const [params] = useSearchParams();

  // Algunos de los parámetros que agrega Mercado Pago a la back_url:
  const paymentId = params.get("payment_id");
  const status = params.get("status");
  const mesaId = params.get("external_reference");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <div className="text-6xl">✅</div>
      <h1 className="text-xl font-bold">¡Pago aprobado!</h1>
      <p className="text-sm text-slate-500">
        Mercado Pago confirmó tu pago. La mesa se va a marcar como pagada en la caja en tiempo
        real (vía WebSocket), apenas el backend procese la notificación.
      </p>

      <dl className="mt-2 w-full space-y-1 rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-500">
        <div className="flex justify-between">
          <dt>Estado:</dt>
          <dd className="font-medium">{status ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Payment ID:</dt>
          <dd className="font-medium">{paymentId ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Mesa (external_reference):</dt>
          <dd className="font-medium">{mesaId ?? "—"}</dd>
        </div>
      </dl>

      <Link to="/caja">
        <Btn className="mt-4">Volver a la Caja</Btn>
      </Link>
    </div>
  );
}
