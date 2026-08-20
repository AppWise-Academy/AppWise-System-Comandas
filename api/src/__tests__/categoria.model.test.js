import CategoriaModel from "../models/Categoria.js";
import { createCategoriaSchema } from "../schemas/categoria.schema.js";

describe("Schema de Categoria", () => {
  it("aplica defaults y timestamps", () => {
    const categoria = new CategoriaModel({ name: "Entradas" });

    expect(categoria.active).toBe(true);
    expect(categoria.order).toBe(0);
    expect(categoria.image).toBeNull();
    expect(categoria.imagePublicId).toBeNull();
    expect(CategoriaModel.schema.path("createdAt")).toBeDefined();
    expect(CategoriaModel.schema.path("updatedAt")).toBeDefined();
  });

  it("valida name requerido y order no negativo", () => {
    const categoria = new CategoriaModel({ order: -1 });
    const error = categoria.validateSync();

    expect(error.errors.name).toBeDefined();
    expect(error.errors.order).toBeDefined();
  });

  it("normaliza los datos de creación", () => {
    const result = createCategoriaSchema.parse({
      name: "  Entradas  ",
      description: "Categoría de entradas",
      order: 1,
    });

    expect(result).toEqual({
      name: "Entradas",
      description: "Categoría de entradas",
      order: 1,
      active: true,
      image: null,
      imagePublicId: null,
    });
  });

});
