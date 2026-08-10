import CategoriaModel from "../models/Categoria.js";

describe("Schema de Categoria", () => {
  it("aplica defaults y timestamps", () => {
    const categoria = new CategoriaModel({ nombre: "Entradas" });

    expect(categoria.activa).toBe(true);
    expect(categoria.orden).toBe(0);
    expect(categoria.imagen).toBeNull();
    expect(CategoriaModel.schema.path("createdAt")).toBeDefined();
    expect(CategoriaModel.schema.path("updatedAt")).toBeDefined();
  });

  it("valida nombre requerido y orden no negativo", () => {
    const categoria = new CategoriaModel({ orden: -1 });
    const error = categoria.validateSync();

    expect(error.errors.nombre).toBeDefined();
    expect(error.errors.orden).toBeDefined();
  });
});
