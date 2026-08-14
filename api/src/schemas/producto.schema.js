import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createProductoSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .trim()
    .min(2, "Min 2 characters")
    .max(120, "Max 120 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Max 1000 characters")
    .optional(),

  category: z
    .string({
      required_error: "Category is required",
    })
    .regex(objectIdPattern, "Category must be a valid ObjectId"),

  price: z
    .number({
      required_error: "Price is required",
    })
    .min(0, "Price cannot be negative"),

  cost: z
    .number()
    .min(0, "Cost cannot be negative")
    .optional(),

  available: z
    .boolean()
    .default(true),

  image: z
    .string()
    .url("Image must be a valid URL")
    .nullable()
    .default(null),

  imagePublicId: z
    .string()
    .trim()
    .nullable()
    .default(null),

  stock: z
    .number()
    .int("Stock must be an integer")
    .min(-1, "Stock cannot be lower than -1")
    .default(-1),

  sold: z
    .number()
    .int("Sold count must be an integer")
    .min(0, "Sold count cannot be negative")
    .default(0),

  order: z
    .number()
    .int("Order must be an integer")
    .min(0, "Order cannot be negative")
    .default(0),

  active: z
    .boolean()
    .default(true),
});
