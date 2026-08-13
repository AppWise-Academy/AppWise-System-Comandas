// ============================================================
// api/payments.ts
// ------------------------------------------------------------
// ⚠️ A diferencia de `api/index.ts` (que devuelve datos MOCKEADOS desde
// `mocks/datos.ts`, sin tocar red), este archivo SÍ hace un fetch real
// contra nuestro backend de Express. Es a propósito: el objetivo de esta
// PoC es que la clase vea el viaje completo (front → back → Mercado
// Pago), así que acá no tiene sentido simularlo.
//
// Requiere tener el backend corriendo (`npm run dev` en /api) y la
// variable VITE_API_URL apuntando a él (ver client/.env).
// ============================================================

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export interface PreferenciaPago {
  preferenceId: string;
  initPoint: string;
  // Según el tipo de credencial, puede venir vacío: ver el fallback en
  // Caja.tsx (`sandboxInitPoint ?? initPoint`).
  sandboxInitPoint: string | null;
  mesa: { id: string; numero: number; total: number };
}

/**
 * Le pide al backend que cree la preferencia de pago para una mesa.
 * El backend responde con `sandboxInitPoint`: la URL del Checkout Pro de
 * Mercado Pago (modo pruebas) a la que hay que redirigir al usuario.
 */
export async function crearPreferenciaPago(mesaId: string): Promise<PreferenciaPago> {
  const res = await fetch(`${API_URL}/api/payments/create-preference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mesaId }),
  });

  const json = await res.json();

  if (!res.ok) {
    // El errorHandler global del backend responde `{ success: false, message }`
    // (ver shared/responses/ErrorResponse.js) ante cualquier error.
    throw new Error(json.message ?? "No se pudo generar el pago");
  }

  return json.data as PreferenciaPago;
}
