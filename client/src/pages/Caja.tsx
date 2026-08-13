// ============================================================
// pages/Caja.tsx — PoC de integración con Mercado Pago
// ------------------------------------------------------------
// Flujo completo que arma este componente:
//
//  1. El usuario elige una mesa (mock) y hace click en "Generar Pago".
//  2. Le pedimos al BACKEND que cree la preferencia de Mercado Pago
//     (api/payments.ts → POST /api/payments/create-preference).
//  3. Redirigimos el navegador al Checkout de Mercado Pago
//     (`sandboxInitPoint`) para que el cliente pague con una tarjeta de prueba.
//  4. Mercado Pago le pega un webhook a NUESTRO BACKEND cuando el pago se
//     aprueba (esto pasa del lado del servidor, esta pantalla ni se
//     entera todavía).
//  5. El backend, al procesar ese webhook, emite un evento de Socket.io
//     ("payment_success"). Esta pantalla está escuchando ese evento desde
//     que se montó, así que la alerta aparece SOLA, sin que nadie
//     refresque la página: eso es lo que hace "en tiempo real".
//
// Ver DOCUMENTACION_MERCADO_PAGO.md para el diagrama completo del flujo.
// ============================================================

import { useEffect, useState } from "react";
import { crearPreferenciaPago } from "../api/payments";
import { getSocket } from "../lib/socket";
import { useSocketConnected } from "../hooks/useSocketConnected";
import { Btn } from "../components/ui/Btn";
import { Alert } from "../components/ui/Feedback";
import { plata } from "../lib";

// Mesas mockeadas del lado del FRONT, solo para tener algo que mostrar en
// el selector. Los ids ("m1", "m2", "m3") tienen que coincidir con los
// mockeados del lado del BACKEND (ver MESAS_MOCK en payment.service.js),
// porque es el backend el que decide el monto real a cobrar — el front
// nunca manda el precio, solo el id de la mesa.
const MESAS = [
  { id: "m1", numero: 1 },
  { id: "m2", numero: 2 },
  { id: "m3", numero: 3 },
];

interface PagoRecibido {
  mesaId: string;
  numero: number | null;
  monto: number;
  paymentId: string;
  fecha: string;
}

export function Caja() {
  const [mesaId, setMesaId] = useState(MESAS[0].id);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimoPago, setUltimoPago] = useState<PagoRecibido | null>(null);

  // El socket YA está conectado por RootLayout (se abre una vez, cuando
  // arranca la sesión — ver layouts/RootLayout.tsx). Acá NO volvemos a
  // llamar `connect()`/`disconnect()`: si lo hiciéramos, salir de esta
  // página cortaría el socket para el resto de la app. Este componente
  // solo hace dos cosas: mostrar el estado (mismo hook que usa el navbar)
  // y suscribirse al evento puntual que le interesa.
  const conectado = useSocketConnected();

  useEffect(() => {
    const socket = getSocket();

    // Este es EL evento que dispara todo el flujo: lo emite el backend
    // (getIO().emit("payment_success", ...)) apenas confirma, vía webhook,
    // que un pago fue aprobado. El nombre del evento tiene que ser
    // IDÉNTICO en ambos lados (front y back) o nunca va a matchear.
    const onPaymentSuccess = (pago: PagoRecibido) => setUltimoPago(pago);
    socket.on("payment_success", onPaymentSuccess);

    return () => {
      socket.off("payment_success", onPaymentSuccess);
    };
  }, []);

  // --- Generar el pago -----------------------------------------
  async function handleGenerarPago() {
    setCargando(true);
    setError(null);

    try {
      const preferencia = await crearPreferenciaPago(mesaId);

      // Mandamos al cliente al Checkout de Mercado Pago. Preferimos
      // `sandboxInitPoint` para poder pagar con las tarjetas de prueba de
      // MP sin mover dinero real, pero con credenciales de TEST el propio
      // `initPoint` ya apunta al checkout de pruebas (según la cuenta,
      // `sandboxInitPoint` puede venir vacío) — por eso el fallback.
      window.location.href = preferencia.sandboxInitPoint ?? preferencia.initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">💳 Caja — PoC Mercado Pago</h1>

      {/* Indicador de conexión al WebSocket */}
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <span>{conectado ? "🟢" : "🔴"}</span>
        {conectado ? "Conectado al servidor en tiempo real" : "Desconectado del WebSocket"}
      </p>

      {error && <Alert tipo="error">❌ {error}</Alert>}

      {ultimoPago && (
        <Alert tipo="ok">
          ✅ ¡Pago recibido en tiempo real! Mesa {ultimoPago.numero} — {plata(ultimoPago.monto)}{" "}
          (payment_id: {ultimoPago.paymentId})
        </Alert>
      )}

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Mesa a cobrar
          <select
            value={mesaId}
            onChange={(e) => setMesaId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {MESAS.map((m) => (
              <option key={m.id} value={m.id}>
                Mesa {m.numero}
              </option>
            ))}
          </select>
        </label>

        <Btn onClick={handleGenerarPago} disabled={cargando} className="w-full">
          {cargando ? "Generando..." : "Generar Pago"}
        </Btn>
      </div>

      <p className="text-xs text-slate-400">
        Al hacer click, se te va a redirigir al Checkout de Mercado Pago
        (sandbox). Usá una{" "}
        <a
          className="underline"
          href="https://www.mercadopago.com.ar/developers/es/docs/checkout-api/additional-content/your-integrations/test/cards"
          target="_blank"
          rel="noreferrer"
        >
          tarjeta de prueba
        </a>{" "}
        para simular el pago.
      </p>
    </div>
  );
}
