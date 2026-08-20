import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { sendMailSchema } from "../schemas/mail.schema.js";
import {
  sendSmtpEmailController,
  sendResendEmailController,
  sendEmailController,
} from "../controllers/email.controller.js";

const router = Router();

// Este archivo se monta automáticamente en /api/mail (ver routes/index.js:
// el nombre del archivo, sin extensión, define el prefijo de la ruta).

// Endpoints explícitos: útiles en la clase para comparar lado a lado cómo
// responde cada proveedor con el mismo template.
router.post("/smtp", validate(sendMailSchema), sendSmtpEmailController);
router.post("/resend", validate(sendMailSchema), sendResendEmailController);

// Endpoint unificado: el mismo body, pero el campo `provider` decide el
// camino por debajo. Este es el que se parece a como se va a ver, en el
// futuro, el envío de un pago (`provider: "mercadopago" | "stripe"`).
router.post("/send", validate(sendMailSchema), sendEmailController);

export default router;
