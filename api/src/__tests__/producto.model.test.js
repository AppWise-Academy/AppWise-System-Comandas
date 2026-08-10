import mongoose from "mongoose";
import ProductoModel from "../models/Producto.js";

describe("Schema de Producto", () => {
  it("aplica defaults y referencia Categoria", () => {
    const producto = new ProductoModel({
      nombre: "Empanada",
      categoria: new mongoose.Types.ObjectId(),
      precio: 1500,
    });

    expect(producto.disponible).toBe(true);
    expect(producto.stock).toBe(-1);
    expect(producto.vendidos).toBe(0);
    expect(producto.activo).toBe(true);
    expect(ProductoModel.schema.path("categoria").options.ref).toBe("Categoria");
  });

  it("valida precio y stock", () => {
    const producto = new ProductoModel({
      nombre: "Empanada",
      categoria: new mongoose.Types.ObjectId(),
      precio: -1,
      stock: -2,
    });
    const error = producto.validateSync();

    expect(error.errors.precio).toBeDefined();
    expect(error.errors.stock).toBeDefined();
  });
});

