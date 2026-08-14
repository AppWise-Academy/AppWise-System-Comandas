import { jest } from "@jest/globals";
import request from "supertest";

const findOneCategoryMock = jest.fn();
const createProductMock = jest.fn();
const findProductsMock = jest.fn();
const countProductsMock = jest.fn();
const findProductByIdMock = jest.fn();
const destroyMock = jest.fn();

class FakeCloudinaryStorage {
  _handleFile(_req, file, callback) {
    file.stream.on("data", () => {});
    file.stream.on("end", () => {
      callback(undefined, {
        path: "https://res.cloudinary.com/demo/image/upload/product.webp",
        filename: "appwise-comandas/menu/productos/product",
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
    findOne: findOneCategoryMock,
  },
}));

jest.unstable_mockModule("../models/Producto.js", () => ({
  default: {
    create: createProductMock,
    find: findProductsMock,
    countDocuments: countProductsMock,
    findById: findProductByIdMock,
  },
}));

const { default: app } = await import("../app.js");

describe("Products API", () => {
  beforeEach(() => {
    findOneCategoryMock.mockReset();
    createProductMock.mockReset();
    findProductsMock.mockReset();
    countProductsMock.mockReset();
    findProductByIdMock.mockReset();
    destroyMock.mockReset();
  });

  it("creates a product without an image", async () => {
    const createdProduct = {
      _id: "product-1",
      name: "Empanada",
      description: "Carne cortada a cuchillo",
      category: "507f1f77bcf86cd799439011",
      price: 1500,
      available: true,
      image: null,
      imagePublicId: null,
      stock: -1,
      sold: 0,
      order: 0,
      active: true,
    };
    findOneCategoryMock.mockResolvedValue({ _id: "category-1", active: true });
    createProductMock.mockResolvedValue(createdProduct);

    const response = await request(app)
      .post("/api/menu/productos")
      .send({
        name: "  Empanada  ",
        description: "  Carne cortada a cuchillo  ",
        category: "507f1f77bcf86cd799439011",
        price: 1500,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(createdProduct);
    expect(findOneCategoryMock).toHaveBeenCalledWith({
      _id: "507f1f77bcf86cd799439011",
      active: true,
    });
    expect(createProductMock).toHaveBeenCalledWith({
      name: "Empanada",
      description: "Carne cortada a cuchillo",
      category: "507f1f77bcf86cd799439011",
      price: 1500,
      available: true,
      image: null,
      imagePublicId: null,
      stock: -1,
      sold: 0,
      order: 0,
      active: true,
    });
  });

  it("creates a product with an optional multipart image", async () => {
    const createdProduct = {
      _id: "product-2",
      name: "Limonada",
      category: "507f1f77bcf86cd799439011",
      price: 900,
      cost: 250,
      available: false,
      image: "https://res.cloudinary.com/demo/image/upload/product.webp",
      imagePublicId: "appwise-comandas/menu/productos/product",
      stock: 10,
      sold: 0,
      order: 1,
      active: true,
    };
    findOneCategoryMock.mockResolvedValue({ _id: "category-1", active: true });
    createProductMock.mockResolvedValue(createdProduct);

    const response = await request(app)
      .post("/api/menu/productos")
      .field("name", "Limonada")
      .field("category", "507f1f77bcf86cd799439011")
      .field("price", "900")
      .field("cost", "250")
      .field("available", "false")
      .field("stock", "10")
      .field("order", "1")
      .attach("image", Buffer.from("product image"), "product.webp");

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(createdProduct);
    expect(createProductMock).toHaveBeenCalledWith({
      name: "Limonada",
      category: "507f1f77bcf86cd799439011",
      price: 900,
      cost: 250,
      available: false,
      image: "https://res.cloudinary.com/demo/image/upload/product.webp",
      imagePublicId: "appwise-comandas/menu/productos/product",
      stock: 10,
      order: 1,
      sold: 0,
      active: true,
    });
  });

  it("rejects products for a missing or inactive category", async () => {
    findOneCategoryMock.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/menu/productos")
      .send({
        name: "Empanada",
        category: "507f1f77bcf86cd799439011",
        price: 1500,
      });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("CATEGORY_NOT_FOUND");
    expect(createProductMock).not.toHaveBeenCalled();
  });

  it("cleans the uploaded image when product validation fails", async () => {
    const response = await request(app)
      .post("/api/menu/productos")
      .field("name", "A")
      .field("category", "invalid")
      .field("price", "-1")
      .attach("image", Buffer.from("invalid product"), "product.webp");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(findOneCategoryMock).not.toHaveBeenCalled();
    expect(createProductMock).not.toHaveBeenCalled();
    expect(destroyMock).toHaveBeenCalledWith("appwise-comandas/menu/productos/product");
  });

  it("returns 409 when the product name is duplicated", async () => {
    findOneCategoryMock.mockResolvedValue({ _id: "category-1", active: true });
    createProductMock.mockRejectedValue({ code: 11000 });

    const response = await request(app)
      .post("/api/menu/productos")
      .send({
        name: "Empanada",
        category: "507f1f77bcf86cd799439011",
        price: 1500,
      });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("PRODUCT_NAME_DUPLICATE");
  });

  it("returns filtered and paginated products with a limited category", async () => {
    const data = [
      {
        _id: "product-1",
        name: "Empanada",
        category: { _id: "category-1", name: "Entradas" },
      },
    ];
    const query = {
      populate: jest.fn(),
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn(),
    };
    query.populate.mockReturnValue(query);
    query.sort.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.limit.mockResolvedValue(data);
    findProductsMock.mockReturnValue(query);
    countProductsMock.mockResolvedValue(7);

    const response = await request(app)
      .get("/api/menu/productos")
      .query({
        skip: "2",
        limit: "2",
        category: "507f1f77bcf86cd799439011",
        available: "false",
        active: "true",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.data).toEqual(data);
    expect(response.body.data.pagination).toEqual({
      skip: 2,
      limit: 2,
      totalItems: 7,
    });
    expect(findProductsMock).toHaveBeenCalledWith({
      category: "507f1f77bcf86cd799439011",
      available: false,
      active: true,
    });
    expect(query.populate).toHaveBeenCalledWith({
      path: "category",
      select: "name description order active image imagePublicId",
    });
    expect(query.sort).toHaveBeenCalledWith({ order: 1, name: 1, _id: 1 });
    expect(query.skip).toHaveBeenCalledWith(2);
    expect(query.limit).toHaveBeenCalledWith(2);
  });

  it("uses active products and safe pagination defaults", async () => {
    const query = {
      populate: jest.fn(),
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn(),
    };
    query.populate.mockReturnValue(query);
    query.sort.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.limit.mockResolvedValue([]);
    findProductsMock.mockReturnValue(query);
    countProductsMock.mockResolvedValue(0);

    const response = await request(app).get("/api/menu/productos");

    expect(response.status).toBe(200);
    expect(findProductsMock).toHaveBeenCalledWith({ active: true });
    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.limit).toHaveBeenCalledWith(20);
  });

  it("uses safe pagination defaults for invalid numeric query parameters", async () => {
    const query = {
      populate: jest.fn(),
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn(),
    };
    query.populate.mockReturnValue(query);
    query.sort.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.limit.mockResolvedValue([]);
    findProductsMock.mockReturnValue(query);
    countProductsMock.mockResolvedValue(0);

    const response = await request(app)
      .get("/api/menu/productos")
      .query({ skip: "invalid", limit: "0", available: "false" });

    expect(response.status).toBe(200);
    expect(findProductsMock).toHaveBeenCalledWith({
      available: false,
      active: true,
    });
    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.limit).toHaveBeenCalledWith(20);
  });

  it("returns a detailed product with a limited category", async () => {
    const data = {
      _id: "product-1",
      name: "Empanada",
      category: { _id: "category-1", name: "Entradas" },
    };
    const populateMock = jest.fn().mockResolvedValue(data);
    findProductByIdMock.mockReturnValue({ populate: populateMock });

    const response = await request(app)
      .get("/api/menu/productos/507f1f77bcf86cd799439011");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(data);
    expect(findProductByIdMock).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
    expect(populateMock).toHaveBeenCalledWith({
      path: "category",
      select: "name description order active image imagePublicId",
    });
  });

  it("returns 404 when the product does not exist", async () => {
    const populateMock = jest.fn().mockResolvedValue(null);
    findProductByIdMock.mockReturnValue({ populate: populateMock });

    const response = await request(app)
      .get("/api/menu/productos/507f1f77bcf86cd799439011");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("delegates invalid product IDs to the service error handling", async () => {
    const populateMock = jest.fn().mockRejectedValue({ name: "CastError" });
    findProductByIdMock.mockReturnValue({ populate: populateMock });

    const response = await request(app)
      .get("/api/menu/productos/not-an-object-id");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("PRODUCT_NOT_FOUND");
    expect(findProductByIdMock).toHaveBeenCalledWith("not-an-object-id");
  });
});
