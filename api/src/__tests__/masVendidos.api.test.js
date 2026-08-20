import { jest } from "@jest/globals";
import request from "supertest";

const findProductsMock = jest.fn();

jest.unstable_mockModule("../models/Producto.js", () => ({
  default: {
    find: findProductsMock,
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

  it("returns 501 for a valid temporal period until #13 provides the data", async () => {
    const response = await request(app)
      .get("/api/menu/mas-vendidos")
      .query({ periodo: "dia" });

    expect(response.status).toBe(501);
    expect(response.body.code).toBe("TEMPORAL_RANKING_UNAVAILABLE");
    expect(findProductsMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an unsupported temporal period", async () => {
    const response = await request(app)
      .get("/api/menu/mas-vendidos")
      .query({ periodo: "ano" });

    expect(response.status).toBe(400);
    expect(findProductsMock).not.toHaveBeenCalled();
  });
});
