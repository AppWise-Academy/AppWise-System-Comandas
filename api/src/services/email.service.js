import {
  getSmtpTransporter,
  getPreviewUrl,
} from "../config/nodemailer.config.js";
import { getResendClient } from "../config/resend.config.js";
import { renderEmailTemplate } from "../utils/renderTemplate.js";
import { SETTINGS_ENV } from "../settings/index.js";
import { ExternalServiceError } from "../shared/errors/ExternalServiceError.js";
import { ValidationError } from "../shared/errors/ValidationError.js";

/**
 * Envía un correo usando Nodemailer contra un servidor SMTP clásico.
 *
 * @param {{to: string, subject: string, template: string, data: object}} payload
 */
async function sendMailSmtp({ to, subject, template, data }) {
  const html = renderEmailTemplate(template, data);

  try {
    const transporter = await getSmtpTransporter();
    const { fromName, fromEmail } = SETTINGS_ENV.mail.smtp;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    // Si estamos usando el fallback de Ethereal (ver nodemailer.config.js),
    // esto devuelve un link para ver el correo renderizado en el navegador.
    // Con un SMTP real devuelve `false`.
    const previewUrl = getPreviewUrl(info);

    return {
      provider: "smtp",
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    };
  } catch (error) {
    // Nunca dejamos que un error "crudo" de Nodemailer/SMTP llegue al
    // cliente: lo traducimos a un ApiError conocido, con un código propio,
    // para que el errorHandler global lo formatee igual que cualquier otro
    // error de la API (y el front pueda reaccionar según `code`).
    throw new ExternalServiceError(
      `No se pudo enviar el correo por SMTP: ${error.message}`,
      "SMTP_SEND_ERROR",
    );
  }
}

/**
 * Envía un correo usando la API de Resend.
 *
 * @param {{to: string, subject: string, template: string, data: object}} payload
 */
async function sendMailResend({ to, subject, template, data }) {
  const html = renderEmailTemplate(template, data);

  try {
    const resend = getResendClient();
    const { fromEmail } = SETTINGS_ENV.mail.resend;

    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    // El SDK de Resend NO lanza excepción ante errores de la API (permisos,
    // dominio no verificado, etc): los devuelve en `error`. Por eso lo
    // chequeamos a mano en vez de confiar solo en un try/catch.
    if (error) {
      throw new Error(error.message || "Error desconocido de Resend");
    }

    return {
      provider: "resend",
      messageId: result.id,
      previewUrl: null,
    };
  } catch (error) {
    throw new ExternalServiceError(
      `No se pudo enviar el correo por Resend: ${error.message}`,
      "RESEND_SEND_ERROR",
    );
  }
}

// --- Dispatcher --------------------------------------------------------
// Este mapa es la pieza clave para mantener la arquitectura "limpia" que
// se pide en la consigna: el controlador NUNCA sabe si el correo salió por
// SMTP o por Resend, solo le dice al service "mandá este correo". El día
// de mañana, integrar Mercado Pago va a seguir el mismo patrón: un
// `payment.service.js` con un dispatcher `{ mercadopago: ..., stripe: ... }`
// y controladores que ni se enteran de cuál pasarela se usa por debajo.
const providers = {
  smtp: sendMailSmtp,
  resend: sendMailResend,
};

/**
 * Punto de entrada único para enviar un correo, eligiendo el proveedor por
 * nombre. Es la función que usarían el resto de los services de la app
 * (ej: notificar una comanda nueva) sin acoplarse a un proveedor puntual.
 *
 * @param {{provider?: "smtp"|"resend", to: string, subject: string, template: string, data: object}} payload
 */
async function sendEmail({ provider = "smtp", ...payload }) {
  const send = providers[provider];

  if (!send) {
    throw new ValidationError(`Proveedor de email no soportado: "${provider}"`);
  }

  return send(payload);
}

export { sendMailSmtp, sendMailResend, sendEmail };
