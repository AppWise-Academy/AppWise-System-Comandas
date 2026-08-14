import { jest } from "@jest/globals";
import request from "supertest";

const findOneCategoryMock = jest.fn();
const createProductMock = jest.fn();
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
  },
}));

const { default: app } = await import("../app.js");

describe("Product creation API", () => {
  beforeEach(() => {
    findOneCategoryMock.mockReset();
    createProductMock.mockReset();
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
});
