import { z } from "zod";

export const createCategoriaSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .trim()
    .min(2, "Min 2 characters")
    .max(80, "Max 80 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Max 80 characters"),

  order: z
    .number()
    .min(0, "Order cannot be negative")
    .nullable()
    .default(0),

  active: z
    .boolean()
    .default(true),

  image: z
    .string()
    .url("Image must be a valid URL")
    .nullable()
    .default(null),
});

