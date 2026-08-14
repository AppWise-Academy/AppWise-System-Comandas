import { z } from "zod";
import ApiError from "../shared/errors/ApiError.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const saleRecordSchema = z.object({
  comandaId: z.string().trim().min(1, "Comanda ID is required"),
  items: z
    .array(
      z.object({
        productId: z.string().regex(objectIdPattern, "Product ID must be a valid ObjectId"),
        quantity: z.number().int().positive("Quantity must be greater than zero"),
      }).strict(),
    )
    .min(1, "At least one item is required"),
  cobradoEn: z.coerce.date(),
}).strict();

export const salesRankingRequestSchema = z.object({
  period: z.enum(["dia", "semana", "mes"]),
  limit: z.number().int().min(1).max(50),
}).strict();

const salesRankingItemSchema = z.object({
  productId: z.string().regex(objectIdPattern, "Product ID must be a valid ObjectId"),
  quantity: z.number().int().nonnegative("Quantity cannot be negative"),
}).strict();

async function unavailableSalesOperation() {
  throw new ApiError(
    "Sales integration is not available",
    501,
    "SALES_INTEGRATION_UNAVAILABLE",
  );
}

export function createSalesPort({
  recordSale = unavailableSalesOperation,
  getRanking = unavailableSalesOperation,
} = {}) {
  if (typeof recordSale !== "function" || typeof getRanking !== "function") {
    throw new TypeError("Sales port operations must be functions");
  }

  return {
    async recordSale(input) {
      return recordSale(saleRecordSchema.parse(input));
    },

    async getRanking(input) {
      const validatedInput = salesRankingRequestSchema.parse(input);
      const ranking = await getRanking(validatedInput);

      return z.array(salesRankingItemSchema).parse(ranking);
    },
  };
}

export const salesPort = createSalesPort();
