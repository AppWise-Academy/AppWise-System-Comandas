import { z } from "zod";

// Los nombres de los templates disponibles viven acá, como enum, para que
// Zod rechace de entrada un template inexistente ANTES de intentar
// renderizarlo (en vez de fallar más adentro, en renderTemplate.js).
const TEMPLATE_NAMES = ["welcome", "order-confirmation"];

export const sendMailSchema = z.object({
  to: z
    .string({ error: "El email de destino es requerido" })
    .trim()
    .email("El email de destino no es válido"),

  subject: z
    .string({ error: "El asunto es requerido" })
    .trim()
    .min(3, "El asunto debe tener al menos 3 caracteres"),

  template: z.enum(TEMPLATE_NAMES, {
    error: `El template debe ser uno de: ${TEMPLATE_NAMES.join(", ")}`,
  }),

  // Los datos que se inyectan en el template (ej: { name: "Juan" }).
  // Queda abierto a propósito: cada template espera sus propias claves.
  data: z.record(z.string(), z.any()).default({}),

  // Solo lo usa el endpoint unificado POST /api/mail/send. Los endpoints
  // explícitos (/smtp, /resend) lo ignoran porque ya saben qué proveedor usar.
  provider: z.enum(["smtp", "resend"]).default("smtp"),
});
