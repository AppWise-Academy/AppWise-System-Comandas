import CategoriaModel from "../models/Categoria.js";
import { ConflictError, ValidationError } from "../shared/errors/index.js";

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

export async function list({ skip = 0, limit = 20, activas = true } = {}) {
  const filter = { active: activas };
  const [data, totalItems] = await Promise.all([
    CategoriaModel.find(filter)
      .sort({ order: 1, name: 1, _id: 1 })
      .skip(skip)
      .limit(limit),
    CategoriaModel.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      skip,
      limit,
      totalItems,
    },
  };
}
