import { Resend } from "resend";
import { SETTINGS_ENV } from "../settings/index.js";

// Mismo patrón que nodemailer.config.js: singleton perezoso (lazy).
//
// El "por qué" de que sea PEREZOSO (se crea recién cuando alguien lo pide,
// no cuando arranca la app): si hiciéramos `new Resend(apiKey)` a nivel de
// módulo y un alumno todavía no configuró RESEND_API_KEY, la app rompería
// al arrancar aunque ese alumno solo quiera probar Nodemailer. Con el
// singleton perezoso, el error recién aparece si REALMENTE intenta pegarle
// al endpoint de Resend, y en ese momento el mensaje es mucho más claro.
let resendClient = null;

export function getResendClient() {
  if (resendClient) return resendClient;

  const { apiKey } = SETTINGS_ENV.mail.resend;

  if (!apiKey) {
    // Lanzamos un Error común (no ApiError): el servicio de mail es quien
    // decide cómo traducir esto a un error de API (ver email.service.js).
    throw new Error(
      "Falta configurar RESEND_API_KEY en el .env para poder usar Resend"
    );
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}
