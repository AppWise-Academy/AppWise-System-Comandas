import { z } from "zod";

export const cartaQuerySchema = z.object({
  ordenar: z
    .enum(["orden", "nombre", "precio"])
    .default("orden"),
});
