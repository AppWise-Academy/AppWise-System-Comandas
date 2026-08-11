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
};
