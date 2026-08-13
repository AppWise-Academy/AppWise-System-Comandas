import { z } from "zod";

// ============================================================
// schemas/payment.schema.js
// ------------------------------------------------------------
// Solo validamos el endpoint que arma la preferencia (create-preference).
// El webhook (POST /api/payments/webhook) NO se valida con Zod a propósito:
// es Mercado Pago quien nos manda ese body, no un usuario de nuestro front,
// y su forma varía según el tipo de notificación. Ahí conviene ser
// permisivos y parsear "a mano" en el controller (ver payment.controller.js).
// ============================================================

export const createPreferenceSchema = z.object({
  // En esta PoC el ID de la mesa referencia datos MOCKEADOS (ver
  // MESAS_MOCK en payment.service.js). El día de mañana, con la base de
  // datos conectada, este mismo campo apuntaría a un documento real de
  // Mongo. La forma del endpoint no cambia, solo cambia de dónde sale el dato.
  mesaId: z
    .string({ error: "El id de la mesa es requerido" })
    .trim()
    .min(1, "El id de la mesa no puede estar vacío"),
});
