import request from "supertest";
import app from "../app.js";

describe("Error handler para un error inesperado", () => {
  
  it("deberia devolver status 500 por error no controlado", async () => {
    
    const response = await request(app).get("/error");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

});