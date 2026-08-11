import request from "supertest";
import app from "../app.js";

describe("API de categorías", () => {
  it("valida el body de creación con los nombres del schema", async () => {
    const response = await request(app)
      .post("/api/menu/categorias")
      .send({ name: "Entradas" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

