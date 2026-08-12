import { jest } from "@jest/globals";
import request from "supertest";

const findMock = jest.fn();
const countDocumentsMock = jest.fn();

jest.unstable_mockModule("../models/Categoria.js", () => ({
  default: {
    find: findMock,
    countDocuments: countDocumentsMock,
  },
}));

const { default: app } = await import("../app.js");

describe("API de categorías", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("valida el body de creación con los nombres del schema", async () => {
    const response = await request(app)
      .post("/api/menu/categorias")
      .send({ name: "Entradas" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("devuelve categorías paginadas, filtradas y ordenadas", async () => {
    const data = [{ name: "Entradas" }, { name: "Postres" }];
    const query = {
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn(),
    };
    query.sort.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.limit.mockResolvedValue(data);
    findMock.mockReturnValue(query);
    countDocumentsMock.mockResolvedValue(7);

    const response = await request(app)
      .get("/api/menu/categorias")
      .query({ skip: "2", limit: "2", activas: "false" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.data).toEqual(data);
    expect(response.body.data.pagination).toEqual({
      skip: 2,
      limit: 2,
      totalItems: 7,
    });
    expect(findMock).toHaveBeenCalledWith({ active: false });
    expect(query.sort).toHaveBeenCalledWith({ order: 1, name: 1, _id: 1 });
    expect(query.skip).toHaveBeenCalledWith(2);
    expect(query.limit).toHaveBeenCalledWith(2);
  });

  it("usa defaults seguros cuando no recibe paginación", async () => {
    const query = {
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn(),
    };
    query.sort.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.limit.mockResolvedValue([]);
    findMock.mockReturnValue(query);
    countDocumentsMock.mockResolvedValue(0);

    const response = await request(app).get("/api/menu/categorias");

    expect(response.status).toBe(200);
    expect(findMock).toHaveBeenCalledWith({ active: true });
    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.limit).toHaveBeenCalledWith(20);
  });
});

