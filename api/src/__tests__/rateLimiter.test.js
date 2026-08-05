import request from "supertest";
import app from "../app.js";

describe("Pasar el limite de peticiones de autenticación (5)", () => {
  
  it("deberia devolver status 429 por demasiadas peticiones", async () => {
    
    await request(app).post("/api/auth/register").send({name:"Martin", email: "martin@example.com", password: "Mar"});
    await request(app).post("/api/auth/register").send({name:"Martin", email: "martin@example.com", password: "Mar"});
    await request(app).post("/api/auth/register").send({name:"Martin", email: "martin@example.com", password: "Mar"});
    await request(app).post("/api/auth/register").send({name:"Martin", email: "martin@example.com", password: "Mar"});
    await request(app).post("/api/auth/register").send({name:"Martin", email: "martin@example.com", password: "Mar"});

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name:"Martin",
        email: "martin@example.com",
        password: "Mar"
      });

    expect(response.status).toBe(429);
    expect(response.body.success).toBe(false);
  });

});