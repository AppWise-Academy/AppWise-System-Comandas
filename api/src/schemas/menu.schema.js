import { z } from "zod";

export const cartaQuerySchema = z.object({
  ordenar: z
    .enum(["orden", "nombre", "precio"])
    .default("orden"),
});

export const masVendidosQuerySchema = z.object({
  limite: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
  periodo: z
    .enum(["dia", "semana", "mes"])
    .optional(),
}).strict();
