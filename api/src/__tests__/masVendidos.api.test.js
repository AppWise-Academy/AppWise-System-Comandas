import { jest } from "@jest/globals";
import request from "supertest";

const findProductsMock = jest.fn();
const getRankingMock = jest.fn();

jest.unstable_mockModule("../models/Producto.js", () => ({
  default: {
    find: findProductsMock,
  },
}));

jest.unstable_mockModule("../integrations/sales.js", () => ({
  salesPort: {
    getRanking: getRankingMock,
  },
}));

const { default: app } = await import("../app.js");

function createQuery(data) {
  const query = {
    select: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
  };

  query.select.mockReturnValue(query);
  query.populate.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.lean.mockResolvedValue(data);

  return query;
}

describe("Best-selling products API", () => {
  beforeEach(() => {
    findProductsMock.mockReset();
    getRankingMock.mockReset();
  });

  it("returns active products ordered by sold count with a stable tie-break", async () => {
    const products = [
      {
        _id: "product-1",
        name: "Empanada",
        category: { _id: "category-1", name: "Entradas" },
        price: 1500,
        image: null,
        sold: 20,
      },
    ];
    const query = createQuery(products);
    findProductsMock.mockReturnValue(query);

    const response = await request(app)
      .get("/api/menu/mas-vendidos")
      .query({ limite: "10" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(products);
    expect(findProductsMock).toHaveBeenCalledWith({ active: true });
    expect(query.select).toHaveBeenCalledWith("name description category price image sold");
    expect(query.populate).toHaveBeenCalledWith({
      path: "category",
      select: "name description order active image imagePublicId",
    });
    expect(query.sort).toHaveBeenCalledWith({ sold: -1, _id: 1 });
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(getRankingMock).not.toHaveBeenCalled();
  });

  it("uses the default limit of 10", async () => {
    const query = createQuery([]);
    findProductsMock.mockReturnValue(query);

    const response = await request(app).get("/api/menu/mas-vendidos");

    expect(response.status).toBe(200);
    expect(query.limit).toHaveBeenCalledWith(10);
  });

  it.each(["0", "51", "not-a-number", "1.5"]) (
    "returns 400 for an invalid limit: %s",
    async (limite) => {
      const response = await request(app)
        .get("/api/menu/mas-vendidos")
        .query({ limite });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(findProductsMock).not.toHaveBeenCalled();
    },
  );

  it("delegates temporal ranking to the sales port and excludes inactive products", async () => {
    const firstProductId = "507f1f77bcf86cd799439011";
    const secondProductId = "507f1f77bcf86cd799439012";
    getRankingMock.mockResolvedValue([
      { productId: firstProductId, quantity: 8 },
      { productId: secondProductId, quantity: 4 },
    ]);
    const query = createQuery([
      {
        _id: firstProductId,
        name: "Empanada",
        category: { _id: "category-1", name: "Entradas" },
        price: 1500,
        image: null,
        sold: 99,
      },
    ]);
    findProductsMock.mockReturnValue(query);

    const response = await request(app)
      .get("/api/menu/mas-vendidos")
      .query({ periodo: "dia", limite: "2" });

    expect(response.status).toBe(200);
    expect(getRankingMock).toHaveBeenCalledWith({ period: "dia", limit: 2 });
    expect(findProductsMock).toHaveBeenCalledWith({
      _id: { $in: [firstProductId, secondProductId] },
      active: true,
    });
    expect(response.body.data).toEqual([{
      _id: firstProductId,
      name: "Empanada",
      category: { _id: "category-1", name: "Entradas" },
      price: 1500,
      image: null,
      sold: 8,
    }]);
  });

  it("returns 400 for an unsupported period", async () => {
    const response = await request(app)
      .get("/api/menu/mas-vendidos")
      .query({ periodo: "ano" });

    expect(response.status).toBe(400);
    expect(findProductsMock).not.toHaveBeenCalled();
    expect(getRankingMock).not.toHaveBeenCalled();
  });
});
