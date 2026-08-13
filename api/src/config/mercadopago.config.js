import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { SETTINGS_ENV } from "../settings/index.js";
import { ExternalServiceError } from "../shared/errors/ExternalServiceError.js";

// ============================================================
// config/mercadopago.config.js
// ------------------------------------------------------------
// Inicialización del SDK de Mercado Pago v2 (paquete npm "mercadopago").
//
// La v2 del SDK cambió el paradigma respecto a la v1 (que era vieja,
// basada en callbacks y un objeto global `mercadopago.configure(...)`).
// Ahora todo gira alrededor de UNA instancia de configuración
// (`MercadoPagoConfig`) que se le pasa como dependencia a cada "recurso"
// que quieras usar (`Preference`, `Payment`, `MerchantOrder`, etc).
//
// Es el mismo patrón que ya usamos con Resend (`resend.config.js`) o con
// el transporter de Nodemailer: un singleton de módulo, creado una sola
// vez y reutilizado en todos los requests.
// ============================================================

let mpConfig = null;

/**
 * Devuelve (y crea una única vez) la configuración del SDK de Mercado Pago.
 *
 * OJO: a diferencia del mail (que tiene un fallback con Ethereal para que
 * la app levante sin credenciales), acá SÍ exigimos el Access Token. Sin
 * él, Mercado Pago va a rechazar cualquier llamada igual, así que
 * preferimos fallar temprano con un mensaje claro en vez de dejar que el
 * SDK tire un error genérico más adelante.
 */
function getMercadoPagoConfig() {
  if (mpConfig) return mpConfig;

  const { accessToken } = SETTINGS_ENV.mercadopago;

  if (!accessToken) {
    // Traducimos el error de configuración a nuestro ExternalServiceError
    // conocido, para que el errorHandler global lo formatee igual que
    // cualquier otro error de la API (y no un stack trace crudo del SDK).
    throw new ExternalServiceError(
      "Falta configurar MP_ACCESS_TOKEN en el .env. Conseguí tus " +
        "credenciales de prueba en https://www.mercadopago.com.ar/developers/panel/app",
      "MP_NOT_CONFIGURED",
    );
  }

  mpConfig = new MercadoPagoConfig({
    accessToken,
    options: {
      // Tiempo máximo (ms) que esperamos la respuesta de la API de MP
      // antes de abortar la request. Sin esto, un problema de red del
      // lado de Mercado Pago podría dejar tu request colgada.
      timeout: 5000,
    },
  });

  return mpConfig;
}

/**
 * Recurso "Preference": lo usamos para CREAR el link de pago (Checkout
 * Pro) que le mostramos al cliente antes de que pague.
 */
export function getPreferenceClient() {
  return new Preference(getMercadoPagoConfig());
}

/**
 * Recurso "Payment": lo usamos DESPUÉS del pago, del lado del webhook,
 * para consultarle a Mercado Pago los datos reales de un pago a partir
 * de su ID (nunca confiamos en los datos que nos manda la notificación
 * en crudo, siempre los verificamos pidiéndoselos a la API de MP).
 */
export function getPaymentClient() {
  return new Payment(getMercadoPagoConfig());
}
