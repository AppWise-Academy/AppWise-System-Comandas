import { jest } from "@jest/globals";
import request from "supertest";

const findCategoriesMock = jest.fn();
const findProductsMock = jest.fn();

jest.unstable_mockModule("../models/Categoria.js", () => ({
  default: {
    find: findCategoriesMock,
  },
}));

jest.unstable_mockModule("../models/Producto.js", () => ({
  default: {
    find: findProductsMock,
  },
}));

const { default: app } = await import("../app.js");

function createQuery(data) {
  const query = {
    select: jest.fn(),
    sort: jest.fn(),
    lean: jest.fn(),
  };
  query.select.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.lean.mockResolvedValue(data);
  return query;
}

describe("Active menu API", () => {
  beforeEach(() => {
    findCategoriesMock.mockReset();
    findProductsMock.mockReset();
  });

  it("returns active categories grouped with active and available products", async () => {
    const categories = [
      {
        _id: "category-1",
        name: "Entradas",
        description: "Para compartir",
        order: 1,
        image: "https://example.com/entradas.webp",
      },
      {
        _id: "category-2",
        name: "Bebidas",
        description: "Para acompañar",
        order: 2,
        image: null,
      },
    ];
    const products = [
      {
        _id: "product-1",
        name: "Empanada",
        description: "Carne",
        category: "category-1",
        price: 1500,
        image: null,
        order: 1,
      },
      {
        _id: "product-2",
        name: "Limonada",
        description: "Casera",
        category: "category-2",
        price: 900,
        image: null,
        order: 1,
      },
    ];
    const categoryQuery = createQuery(categories);
    const productQuery = createQuery(products);
    findCategoriesMock.mockReturnValue(categoryQuery);
    findProductsMock.mockReturnValue(productQuery);

    const response = await request(app).get("/api/menu/carta");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([
      { ...categories[0], products: [products[0]] },
      { ...categories[1], products: [products[1]] },
    ]);
    expect(findCategoriesMock).toHaveBeenCalledWith({ active: true });
    expect(categoryQuery.select).toHaveBeenCalledWith("name description order image");
    expect(categoryQuery.sort).toHaveBeenCalledWith({ order: 1, name: 1, _id: 1 });
    expect(findProductsMock).toHaveBeenCalledWith({
      category: { $in: ["category-1", "category-2"] },
      active: true,
      available: true,
    });
    expect(productQuery.select).toHaveBeenCalledWith("name description category price image order");
    expect(productQuery.sort).toHaveBeenCalledWith({ order: 1, name: 1, _id: 1 });
    expect(findCategoriesMock).toHaveBeenCalledTimes(1);
    expect(findProductsMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["nombre", { name: 1, order: 1, _id: 1 }],
    ["precio", { price: 1, name: 1, _id: 1 }],
  ])("sorts products deterministically by %s", async (orderBy, sort) => {
    const categoryQuery = createQuery([{ _id: "category-1", name: "Entradas", order: 1 }]);
    const productQuery = createQuery([]);
    findCategoriesMock.mockReturnValue(categoryQuery);
    findProductsMock.mockReturnValue(productQuery);

    const response = await request(app)
      .get("/api/menu/carta")
      .query({ ordenar: orderBy });

    expect(response.status).toBe(200);
    expect(productQuery.sort).toHaveBeenCalledWith(sort);
  });

  it("returns 400 for an unsupported ordering mode", async () => {
    const response = await request(app)
      .get("/api/menu/carta")
      .query({ ordenar: "stock" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(findCategoriesMock).not.toHaveBeenCalled();
    expect(findProductsMock).not.toHaveBeenCalled();
  });

  it("returns an empty menu without querying products when no category is active", async () => {
    findCategoriesMock.mockReturnValue(createQuery([]));

    const response = await request(app).get("/api/menu/carta");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(findProductsMock).not.toHaveBeenCalled();
  });
});
