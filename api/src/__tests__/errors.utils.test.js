import { translateMongooseError } from "../utils/errors.js";

describe("translateMongooseError", () => {
  it("traduce duplicados con mensajes específicos del recurso", () => {
    expect(() =>
      translateMongooseError(
        { code: 11000 },
        "Category name is already registered",
        "CATEGORY_NAME_DUPLICATE",
      ),
    ).toThrow(
      expect.objectContaining({
        statusCode: 409,
        code: "CATEGORY_NAME_DUPLICATE",
      }),
    );
  });

  it("traduce errores de validación con mensajes específicos del recurso", () => {
    expect(() =>
      translateMongooseError(
        { name: "ValidationError" },
        "Invalid category data",
        "CATEGORY_INVALID",
      ),
    ).toThrow(
      expect.objectContaining({
        statusCode: 400,
        code: "CATEGORY_INVALID",
      }),
    );
  });

  it("relanza errores que no pertenecen a Mongoose", () => {
    const error = new Error("Database unavailable");

    expect(() => translateMongooseError(error)).toThrow(error);
  });
});
