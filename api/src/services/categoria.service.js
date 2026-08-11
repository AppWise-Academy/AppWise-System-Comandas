import CategoriaModel from "../models/Categoria.js";
import { ConflictError, NotFoundError, ValidationError } from "../shared/errors/index.js";

function translateMongooseError(error) {
  if (error?.code === 11000) {
    throw new ConflictError("Category name is already registered", "CATEGORY_NAME_DUPLICATE");
  }

  if (error?.name === "ValidationError") {
    throw new ValidationError("Invalid category data", "CATEGORY_INVALID");
  }

  throw error;
}

export async function create(data) {
  try {
    return await CategoriaModel.create(data);
  } catch (error) {
    translateMongooseError(error);
  }
}
