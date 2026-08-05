import request from "supertest";
import app from "../app.js";

describe("Middleware validate.js con zod", () => {
  
  it("deberia devolver status 400 por datos invalidos", async () => {
    
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name:"Martin",
        email: "martin@example.com",
        password: "Mar"
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toHaveProperty("password");
  });

});