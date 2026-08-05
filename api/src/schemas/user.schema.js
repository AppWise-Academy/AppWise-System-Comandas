import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .trim()
    .min(3, "Min 3 characters")
    .max(50, "Max 50 characters"),

  email: z
    .string({
      required_error: "Email is required",
    })
    .trim()
    .email("Invalid email")
    .toLowerCase(),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Min 6 characters"),

  rol: z
    .enum(["admin", "mozo", "cocina", "cajero"], {
      error: "El rol debe ser: admin, mozo, cocina o cajero",
    })
    .default("mozo"),

  isActive: z
    .boolean()
    .default(true),

  avatar: z
    .string()
    .url("Avatar must be a valid URL")
    .nullable()
    .default(null),

  avatarPublicId: z
    .string()
    .nullable()
    .default(null),
});