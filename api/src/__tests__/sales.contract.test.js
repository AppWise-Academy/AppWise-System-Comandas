import { jest } from "@jest/globals";
import ApiError from "../shared/errors/ApiError.js";
import { createSalesPort, saleRecordSchema } from "../integrations/sales.js";

describe("Sales port contract", () => {
  it("passes quantities, comandaId and cobradoEn to the provider", async () => {
    const recordSale = jest.fn().mockResolvedValue(undefined);
    const sales = createSalesPort({
      recordSale,
      getRanking: jest.fn(),
    });
    const cobradoEn = "2026-08-14T20:00:00.000Z";

    await sales.recordSale({
      comandaId: "comanda-1",
      items: [
        {
          productId: "507f1f77bcf86cd799439011",
          quantity: 3,
        },
      ],
      cobradoEn,
    });

    expect(recordSale).toHaveBeenCalledWith({
      comandaId: "comanda-1",
      items: [
        {
          productId: "507f1f77bcf86cd799439011",
          quantity: 3,
        },
      ],
      cobradoEn: new Date(cobradoEn),
    });
  });

  it("rejects a duplicate sale through an idempotent provider double", async () => {
    const processedComandas = new Set();
    const recordSale = jest.fn(async ({ comandaId }) => {
      if (processedComandas.has(comandaId)) {
        throw new ApiError("Sale already registered", 409, "SALE_DUPLICATE");
      }

      processedComandas.add(comandaId);
    });
    const sales = createSalesPort({
      recordSale,
      getRanking: jest.fn(),
    });
    const sale = {
      comandaId: "comanda-1",
      items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
      cobradoEn: "2026-08-14T20:00:00.000Z",
    };

    await sales.recordSale(sale);
    await expect(sales.recordSale(sale)).rejects.toMatchObject({
      statusCode: 409,
      code: "SALE_DUPLICATE",
    });
    expect(recordSale).toHaveBeenCalledTimes(2);
  });

  it("rejects invalid quantities and missing sale identifiers", () => {
    expect(() => saleRecordSchema.parse({
      comandaId: "",
      items: [{ productId: "not-an-id", quantity: 0 }],
      cobradoEn: "invalid-date",
    })).toThrow();
  });

  it("fails closed when no real sales provider is configured", async () => {
    const sales = createSalesPort();

    await expect(sales.recordSale({
      comandaId: "comanda-1",
      items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
      cobradoEn: "2026-08-14T20:00:00.000Z",
    })).rejects.toMatchObject({
      statusCode: 501,
      code: "SALES_INTEGRATION_UNAVAILABLE",
    });
  });
});
