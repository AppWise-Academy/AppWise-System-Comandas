import { jest } from "@jest/globals";
import request from "supertest";

const findMock = jest.fn();
const countDocumentsMock = jest.fn();
const findByIdMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();
const createMock = jest.fn();
const destroyMock = jest.fn();

class FakeCloudinaryStorage {
  _handleFile(_req, file, callback) {
    file.stream.on("data", () => {});
    file.stream.on("end", () => {
      callback(undefined, {
        secure_url: "https://res.cloudinary.com/demo/image/upload/category.webp",
        filename: "appwise-comandas/menu/categorias/category",
      });
    });
  }

  _removeFile(_req, _file, callback) {
    callback();
  }
}

jest.unstable_mockModule("multer-storage-cloudinary", () => ({
  CloudinaryStorage: FakeCloudinaryStorage,
}));

jest.unstable_mockModule("../config/cloudinary.js", () => ({
  default: {
    uploader: {
      destroy: destroyMock,
    },
  },
}));

jest.unstable_mockModule("../models/Categoria.js", () => ({
  default: {
    find: findMock,
    countDocuments: countDocumentsMock,
    findById: findByIdMock,
    findByIdAndUpdate: findByIdAndUpdateMock,
    create: createMock,
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

  it("crea una categoría con imagen opcional usando multipart", async () => {
    const createdCategory = {
      _id: "category-1",
      name: "Entradas",
      description: "Para compartir",
      order: 1,
      active: true,
      image: "https://res.cloudinary.com/demo/image/upload/category.webp",
    };
    createMock.mockResolvedValue(createdCategory);

    const response = await request(app)
      .post("/api/menu/categorias")
      .field("name", "Entradas")
      .field("description", "Para compartir")
      .field("order", "1")
      .field("active", "true")
      .attach("image", Buffer.from("category image"), "category.webp");

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(createdCategory);
    expect(createMock).toHaveBeenCalledWith({
      name: "Entradas",
      description: "Para compartir",
      order: 1,
      active: true,
      image: "https://res.cloudinary.com/demo/image/upload/category.webp",
    });
  });

  it("crea una categoría sin imagen", async () => {
    const createdCategory = {
      _id: "category-2",
      name: "Postres",
      description: "Opciones dulces",
      order: 2,
      active: true,
      image: null,
    };
    createMock.mockResolvedValue(createdCategory);

    const response = await request(app)
      .post("/api/menu/categorias")
      .send({
        name: "Postres",
        description: "Opciones dulces",
        order: 2,
        active: true,
      });

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      name: "Postres",
      description: "Opciones dulces",
      order: 2,
      active: true,
      image: null,
    });
  });

  it("actualiza parcialmente una categoría sin modificar los campos omitidos", async () => {
    const existingCategory = {
      _id: "category-1",
      name: "Entradas",
      description: "Para compartir",
      order: 1,
      active: true,
      image: null,
    };
    const updatedCategory = { ...existingCategory, name: "Entradas frías" };
    findByIdMock.mockResolvedValue(existingCategory);
    findByIdAndUpdateMock.mockResolvedValue(updatedCategory);

    const response = await request(app)
      .put("/api/menu/categorias/507f1f77bcf86cd799439011")
      .send({ name: "Entradas frías" });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(updatedCategory);
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      { name: "Entradas frías" },
      { returnDocument: "after", runValidators: true },
    );
  });

  it("rechaza datos inválidos en la actualización", async () => {
    const response = await request(app)
      .put("/api/menu/categorias/507f1f77bcf86cd799439011")
      .send({ name: "A" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(findByIdMock).not.toHaveBeenCalled();
  });

  it("reemplaza la imagen y elimina el asset anterior después de persistir", async () => {
    const existingCategory = {
      _id: "category-1",
      name: "Entradas",
      image: "https://res.cloudinary.com/demo/image/upload/appwise-comandas/menu/categorias/old.webp",
    };
    const updatedCategory = {
      ...existingCategory,
      image: "https://res.cloudinary.com/demo/image/upload/category.webp",
    };
    findByIdMock.mockResolvedValue(existingCategory);
    findByIdAndUpdateMock.mockResolvedValue(updatedCategory);
    destroyMock.mockResolvedValue({ result: "ok" });

    const response = await request(app)
      .put("/api/menu/categorias/507f1f77bcf86cd799439011")
      .field("name", "Entradas")
      .attach("image", Buffer.from("new category image"), "category.webp");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(updatedCategory);
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      {
        name: "Entradas",
        image: "https://res.cloudinary.com/demo/image/upload/category.webp",
      },
      { returnDocument: "after", runValidators: true },
    );
    expect(destroyMock.mock.invocationCallOrder[0]).toBeGreaterThan(
      findByIdAndUpdateMock.mock.invocationCallOrder[0],
    );
    expect(destroyMock).toHaveBeenCalledWith("appwise-comandas/menu/categorias/old");
  });

  it("limpia la nueva imagen si falla la persistencia", async () => {
    findByIdMock.mockResolvedValue({
      _id: "category-1",
      name: "Entradas",
      image: "https://res.cloudinary.com/demo/image/upload/appwise-comandas/menu/categorias/old.webp",
    });
    findByIdAndUpdateMock.mockRejectedValue(new Error("Database unavailable"));

    const response = await request(app)
      .put("/api/menu/categorias/507f1f77bcf86cd799439011")
      .field("name", "Entradas")
      .attach("image", Buffer.from("new category image"), "category.webp");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(destroyMock).toHaveBeenCalledWith("appwise-comandas/menu/categorias/category");
  });

  it("devuelve 409 cuando el nuevo nombre está duplicado", async () => {
    findByIdMock.mockResolvedValue({ _id: "category-1", name: "Entradas", image: null });
    findByIdAndUpdateMock.mockRejectedValue({ code: 11000 });

    const response = await request(app)
      .put("/api/menu/categorias/507f1f77bcf86cd799439011")
      .send({ name: "Postres" });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("CATEGORY_NAME_DUPLICATE");
  });

  it("devuelve 404 cuando la categoría a actualizar no existe", async () => {
    findByIdMock.mockResolvedValue(null);

    const response = await request(app)
      .put("/api/menu/categorias/507f1f77bcf86cd799439011")
      .send({ name: "Entradas" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("CATEGORY_NOT_FOUND");
    expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
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

  it("devuelve una categoría detallada cuando existe", async () => {
    const data = { _id: "category-1", name: "Entradas", active: true };
    findByIdMock.mockResolvedValue(data);

    const response = await request(app)
      .get("/api/menu/categorias/507f1f77bcf86cd799439011");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(data);
    expect(findByIdMock).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
  });

  it("devuelve 404 cuando la categoría no existe", async () => {
    findByIdMock.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/menu/categorias/507f1f77bcf86cd799439011");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("CATEGORY_NOT_FOUND");
  });
});
