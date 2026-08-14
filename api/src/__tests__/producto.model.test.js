import mongoose from "mongoose";
import ProductoModel from "../models/Producto.js";
import { createProductoSchema } from "../schemas/producto.schema.js";

describe("Product schema", () => {
  it("applies defaults and Categoria reference", () => {
    const producto = new ProductoModel({
      name: "Empanada",
      category: new mongoose.Types.ObjectId(),
      price: 1500,
    });

    expect(producto.available).toBe(true);
    expect(producto.stock).toBe(-1);
    expect(producto.sold).toBe(0);
    expect(producto.active).toBe(true);
    expect(producto.imagePublicId).toBeNull();
    expect(ProductoModel.schema.path("category").options.ref).toBe("Categoria");
  });

  it("validates price and stock", () => {
    const producto = new ProductoModel({
      name: "Empanada",
      category: new mongoose.Types.ObjectId(),
      price: -1,
      stock: -2,
    });
    const error = producto.validateSync();

    expect(error.errors.price).toBeDefined();
    expect(error.errors.stock).toBeDefined();
  });

  it("normalizes product creation data", () => {
    const result = createProductoSchema.parse({
      name: "  Empanada  ",
      description: "  Carne cortada a cuchillo  ",
      category: "507f1f77bcf86cd799439011",
      price: 1500,
    });

    expect(result).toEqual({
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

  it("validates category, price, stock and cost", () => {
    expect(() =>
      createProductoSchema.parse({
        name: "Empanada",
        category: "not-an-object-id",
        price: -1,
        cost: -1,
        stock: -2,
      }),
    ).toThrow();
  });
});
