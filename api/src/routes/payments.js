import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { createPreferenceSchema } from "../schemas/payment.schema.js";
import { createPreferenceController, webhookController } from "../controllers/payment.controller.js";

const router = Router();

// Este archivo se monta automáticamente en /api/payments (ver
// routes/index.js: el nombre del archivo, sin extensión, define el
// prefijo de la ruta — mismo mecanismo que /api/mail o /api/documents).

// Lo llama nuestro FRONTEND para arrancar un pago.
router.post("/create-preference", validate(createPreferenceSchema), createPreferenceController);

// Lo llama MERCADO PAGO (no el front) para avisarnos que un pago cambió
// de estado. Por eso NO tiene `validate(...)`: el body lo define Mercado
// Pago, no nosotros (ver el comentario grande en payment.controller.js).
router.post("/webhook", webhookController);

export default router;
