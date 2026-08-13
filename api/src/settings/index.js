import { required } from "../shared/required.env.js";

export const SETTINGS_ENV = {
  app: {
    port: Number(process.env.PORT) || 4001,
  },
  db: {
    uri: required("MONGO_URI"),
  },
  mail: {
    // OJO: acá NO usamos required(). Si un alumno todavía no configuró
    // SMTP o Resend, la app tiene que poder levantar igual (solo van a
    // fallar esos endpoints puntuales, con un error claro, al llamarlos).
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true = puerto 465 (SSL), false = 587 (STARTTLS)
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      fromName: process.env.MAIL_FROM_NAME || "Sistema de Comandas",
      fromEmail: process.env.MAIL_FROM_EMAIL || "no-reply@comandas.dev",
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    },
  },
  mercadopago: {
    // Tampoco usamos required() acá: la API tiene que poder levantar sin
    // este token configurado (solo van a fallar, con un error claro, los
    // endpoints de pago si lo llamás sin haberlo seteado). Ver
    // config/mercadopago.config.js para el chequeo real.
    accessToken: process.env.MP_ACCESS_TOKEN,
  },
  // URLs públicas de cada lado de la app. Mercado Pago las necesita para
  // saber A DÓNDE mandar al usuario (back_urls, del lado del front) y A
  // DÓNDE avisarnos que hubo un pago (notification_url, del lado del back).
  // Ver la sección "back_urls vs notification_url" en
  // DOCUMENTACION_MERCADO_PAGO.md para el detalle de por qué son cosas
  // distintas y por qué notification_url NO puede ser "localhost" en dev.
  urls: {
    backendUrl: process.env.BACKEND_URL || `http://localhost:${Number(process.env.PORT) || 4001}`,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};
