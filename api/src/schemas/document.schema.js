import { z } from "zod";

// Sub-schema reutilizado tanto por el reporte de Excel como por el ticket
// en PDF: un item de comanda siempre tiene la misma forma.
const orderItemSchema = z.object({
  name: z.string({ error: "El nombre del item es requerido" }).trim().min(1),
  quantity: z.number({ error: "La cantidad es requerida" }).int().positive(),
  price: z.number({ error: "El precio es requerido" }).nonnegative(),
});

// Nota: `date` queda como string simple (no `.or(z.date())`). Un body JSON
// nunca trae un objeto Date real, siempre viaja como string ISO, así que
// aceptar z.date() acá sería una rama que jamás se usa en la práctica.
const orderBaseSchema = {
  orderNumber: z.union([z.string(), z.number()]),
  table: z.union([z.string(), z.number()]),
  waiter: z.string({ error: "El nombre del mozo/a es requerido" }).trim(),
  items: z.array(orderItemSchema).min(1, "La comanda debe tener al menos un item"),
  total: z.number({ error: "El total es requerido" }).nonnegative(),
  date: z.string().optional(),
};

export const salesReportSchema = z.object({
  orders: z
    .array(z.object({ ...orderBaseSchema, status: z.string().default("pendiente") }))
    .min(1, "Debe enviar al menos una comanda para generar el reporte"),
});

export const orderTicketSchema = z.object(orderBaseSchema);
