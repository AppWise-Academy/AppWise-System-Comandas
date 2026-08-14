import CategoriaModel from "../models/Categoria.js";
import { ApiError, NotFoundError } from "../shared/errors/index.js";
import { destroyCloudinaryImage } from "../utils/cloudinary.js";
import { translateMongooseError } from "../utils/errors.js";

export async function create(data) {
  try {
    return await CategoriaModel.create(data);
  } catch (error) {
    translateMongooseError(
      error,
      error?.code === 11000 ? "Category name is already registered" : "Invalid category data",
      error?.code === 11000 ? "CATEGORY_NAME_DUPLICATE" : "CATEGORY_INVALID",
    );
  }
}

export async function update(id, data) {
  let imageToDestroy = null;

  try {
    const existingCategoria = await CategoriaModel.findById(id);

    if (!existingCategoria) {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    const updatedCategoria = await CategoriaModel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedCategoria) {
      throw new ApiError("An error has ocurred during category updating", 500, "CATEGORY_NOT_UPDATED");
    }

    imageToDestroy = data.imagePublicId
      ? existingCategoria.imagePublicId
      : null;

    return updatedCategoria;
  } catch (error) {
    imageToDestroy = data.imagePublicId ?? null;

    if (error?.name === "CastError") {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    translateMongooseError(
      error,
      error?.code === 11000 ? "Category name is already registered" : "Invalid category data",
      error?.code === 11000 ? "CATEGORY_NAME_DUPLICATE" : "CATEGORY_INVALID",
    );
  } finally {
    await destroyCloudinaryImage(imageToDestroy);
  }
}

export async function deactivate(id) {
  try {
    const existingCategoria = await CategoriaModel.findById(id);

    if (!existingCategoria) {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    const deactivatedCategoria = await CategoriaModel.findByIdAndUpdate(
      id,
      { active: false },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!deactivatedCategoria) {
      throw new ApiError("An error has ocurred during category deleting", 500, "CATEGORY_NOT_DEACTIVATED");
    }

    return deactivatedCategoria;
  } catch (error) {
    if (error?.name === "CastError") {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    translateMongooseError(
      error,
      error?.code === 11000 ? "Category name is already registered" : "Invalid category data",
      error?.code === 11000 ? "CATEGORY_NAME_DUPLICATE" : "CATEGORY_INVALID",
    );
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
