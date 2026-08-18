import nodemailer from "nodemailer";
import { SETTINGS_ENV } from "../settings/index.js";

// Guardamos la promesa del transporter (no el transporter en sí) en el
// módulo. Como los módulos de Node se cachean, esta variable actúa como un
// singleton: la primera petición lo crea, todas las siguientes reutilizan
// la misma conexión SMTP en vez de abrir una nueva en cada request.
let transporterPromise = null;

/**
 * Devuelve (y crea una única vez) el transporter SMTP de Nodemailer.
 *
 * Modo "producción": si SMTP_HOST/USER/PASSWORD están seteados en el .env,
 * se conecta a ese servidor SMTP real (Gmail, SendGrid, tu propio server, etc).
 *
 * Modo "clase" (fallback): si no hay credenciales configuradas, generamos
 * una cuenta de prueba en Ethereal (https://ethereal.email) al vuelo. Los
 * correos "se envían" pero quedan atrapados ahí, y Nodemailer nos da una
 * URL para verlos renderizados en el navegador. Así los alumnos prueban el
 * flujo completo sin depender de un Gmail/App Password real.
 */
export function getSmtpTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    const { host, port, secure, user, password } = SETTINGS_ENV.mail.smtp;

    const hasRealCredentials = Boolean(host && user && password);

    if (hasRealCredentials) {
      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass: password },
      });
    }

    const testAccount = await nodemailer.createTestAccount();

    console.warn(
      "⚠️  SMTP no configurado (.env) → usando cuenta de prueba de Ethereal.\n" +
      "    Los correos no llegan a una bandeja real: el link 'previewUrl' de la\n" +
      "    respuesta del endpoint te muestra cómo se ve el correo renderizado."
    );

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  })();

  return transporterPromise;
}

/**
 * Devuelve la URL de "preview" de un envío hecho contra Ethereal.
 * Si el transporter es uno real (SMTP de producción), devuelve `false`.
 */
export function getPreviewUrl(info) {
  return nodemailer.getTestMessageUrl(info);
}
