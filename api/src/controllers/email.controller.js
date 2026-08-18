import { sendMailSmtp, sendMailResend, sendEmail } from "../services/email.service.js";
import { ok } from "../shared/apiResponse.js";

// Usamos `req.validated.body` (no `req.body`) porque ahí es donde el
// middleware `validate()` deja la data YA PARSEADA por Zod, con los
// `.default(...)` aplicados (ej: `data: {}` si no mandaste nada). Leer
// `req.body` directo se saltearía esos defaults.

async function sendSmtpEmailController(req, res) {
  const { to, subject, template, data } = req.validated.body;
  const result = await sendMailSmtp({ to, subject, template, data });
  ok(res, result, { message: "Correo enviado por SMTP" });
}

async function sendResendEmailController(req, res) {
  const { to, subject, template, data } = req.validated.body;
  const result = await sendMailResend({ to, subject, template, data });
  ok(res, result, { message: "Correo enviado por Resend" });
}

// Endpoint unificado: el body decide el proveedor (`provider`), y por
// debajo se resuelve con el mismo dispatcher que usaría cualquier otro
// service de la app para mandar un correo sin acoplarse a un proveedor puntual.
async function sendEmailController(req, res) {
  const { provider, to, subject, template, data } = req.validated.body;
  const result = await sendEmail({ provider, to, subject, template, data });
  ok(res, result, { message: `Correo enviado (proveedor: ${result.provider})` });
}

export { sendSmtpEmailController, sendResendEmailController, sendEmailController };
