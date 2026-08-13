import {
  crearPreferenciaMesa,
  procesarNotificacionPago,
} from "../services/payment.service.js";
import { ok, created } from "../shared/apiResponse.js";
import { logger } from "../utils/logger.js";

// ============================================================
// controllers/payment.controller.js
// ------------------------------------------------------------
// Dos endpoints, dos responsabilidades bien distintas:
//
// 1) createPreferenceController → lo llama NUESTRO FRONTEND (Caja.tsx)
//    cuando el usuario hace click en "Generar Pago".
//
// 2) webhookController → lo llama MERCADO PAGO (sus servidores, no un
//    navegador), como consecuencia de que configuramos `notification_url`
//    al crear la preferencia. Nadie en nuestro front llama a este endpoint
//    directamente.
// ============================================================

async function createPreferenceController(req, res) {
  const { mesaId } = req.validated.body;

  const preferencia = await crearPreferenciaMesa({ mesaId });

  created(res, preferencia, { message: "Preferencia de pago creada" });
}

/**
 * Webhook de Mercado Pago.
 *
 * El formato "Webhooks" (el que usa esta PoC) manda la info en el BODY,
 * en JSON:
 *     POST /webhook
 *     { "type": "payment", "data": { "id": "123456789" }, ... }
 *
 * Pero Mercado Pago también agrega esos mismos datos como QUERY STRING en
 * la URL que llama (ej: `?data.id=123456789&type=payment`), y el viejo
 * formato "IPN" (`?topic=payment&id=123456789`) todavía aparece en cuentas
 * antiguas o mal migradas. Por eso este controller NO usa un schema de
 * Zod fijo (a diferencia del resto de la API): revisamos body Y query,
 * con los nombres de campo de ambos formatos, para no depender de cuál
 * termine usando Mercado Pago en la práctica.
 */
async function webhookController(req, res) {
  const type = req.body?.type ?? req.query?.type ?? req.query?.topic;
  const paymentId =
    req.body?.data?.id ?? req.query?.["data.id"] ?? req.query?.id;

  logger.info({
    message: "\n \n DESDE EL WEBHOOK \n \n",
  });

  logger.info({
    message: `Webhook de Mercado Pago recibido — type: ${type} — id: ${paymentId}`,
    method: req.method,
    path: req.originalUrl,
  });

  // ⚠️ MUY IMPORTANTE: Mercado Pago espera un 200 rápido para no reintentar
  // la notificación (y para no marcarla como fallida en su panel). Por eso
  // el try/catch de acá abajo SIEMPRE responde 200, incluso si algo salió
  // mal procesando el pago puertas adentro: el error queda logueado para
  // que lo revisemos nosotros, pero desde el punto de vista de Mercado
  // Pago la notificación fue "recibida" (no queremos que nos golpee el
  // mismo webhook 10 veces por un bug nuestro).
  try {
    await procesarNotificacionPago({ type, paymentId });
  } catch (error) {
    logger.error({
      message: `Error procesando webhook de MP: ${error.message}`,
      method: req.method,
      path: req.originalUrl,
      stack: error.stack,
    });
  }

  ok(res, null, { message: "Notificación recibida" });
}

export { createPreferenceController, webhookController };
