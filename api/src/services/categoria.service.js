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

export async function getAll({ skip = 0, limit = 20, activas = true } = {}) {
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

export async function getById(id) {
  try {
    const categoria = await CategoriaModel.findById(id);

    if (!categoria) {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    return categoria;
  } catch (error) {
    if (error?.name === "CastError") {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    throw error;
  }
}
