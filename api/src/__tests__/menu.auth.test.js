import jwt from "jsonwebtoken";
import request from "supertest";

process.env.JWT_SECRET = "menu-auth-test-secret";

const { default: app } = await import("../app.js");

const adminRoutes = [
  ["post", "/api/menu/categorias"],
  ["put", "/api/menu/categorias/507f1f77bcf86cd799439011"],
  ["delete", "/api/menu/categorias/507f1f77bcf86cd799439011"],
  ["post", "/api/menu/productos"],
  ["put", "/api/menu/productos/507f1f77bcf86cd799439011"],
  ["delete", "/api/menu/productos/507f1f77bcf86cd799439011"],
];

function createToken(rol) {
  return jwt.sign(
    {
      userId: "507f1f77bcf86cd799439011",
      email: `${rol}@example.com`,
      rol,
    },
    process.env.JWT_SECRET,
  );
}

function sendRequest(method, path, token) {
  const requestBuilder = request(app)[method](path);

  if (token) {
    requestBuilder.set("Authorization", `Bearer ${token}`);
  }

  return requestBuilder.send({});
}

describe("Menu authorization middleware", () => {
  it.each(adminRoutes)("requires authentication for %s %s", async (method, path) => {
    const response = await sendRequest(method, path);

    expect(response.status).toBe(401);
  });

  it("allows an authenticated admin route to continue past the guards", async () => {
    const response = await sendRequest("post", "/api/menu/categorias", createToken("admin"));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects a non-admin user from an admin route", async () => {
    const response = await sendRequest("post", "/api/menu/categorias", createToken("cocina"));

    expect(response.status).toBe(403);
  });

  it("allows cocina and admin roles on product availability", async () => {
    const kitchenResponse = await sendRequest(
      "put",
      "/api/menu/productos/507f1f77bcf86cd799439011/disponible",
      createToken("cocina"),
    );
    const adminResponse = await sendRequest(
      "put",
      "/api/menu/productos/507f1f77bcf86cd799439011/disponible",
      createToken("admin"),
    );

    expect(kitchenResponse.status).toBe(400);
    expect(adminResponse.status).toBe(400);
  });

  it("rejects an unrelated role from product availability", async () => {
    const response = await sendRequest(
      "put",
      "/api/menu/productos/507f1f77bcf86cd799439011/disponible",
      createToken("mesero"),
    );

    expect(response.status).toBe(403);
  });
});
