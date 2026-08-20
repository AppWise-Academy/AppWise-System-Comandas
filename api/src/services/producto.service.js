import CategoriaModel from "../models/Categoria.js";
import ProductoModel from "../models/Producto.js";
import mongoose from "mongoose";
import { ApiError, NotFoundError } from "../shared/errors/index.js";
import { destroyCloudinaryImage } from "../utils/cloudinary.js";
import { translateMongooseError } from "../utils/errors.js";

export async function create(data) {
  try {
    const activeCategory = await CategoriaModel.findOne({
      _id: data.category,
      active: true,
    });

    if (!activeCategory) {
      throw new NotFoundError("Category not found or inactive", "CATEGORY_NOT_FOUND");
    }

    return await ProductoModel.create(data);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateMongooseError(
      error,
      error?.code === 11000 ? "Product name is already registered" : "Invalid product data",
      error?.code === 11000 ? "PRODUCT_NAME_DUPLICATE" : "PRODUCT_INVALID",
    );
  }
}

export async function update(id, data) {
  let imageToDestroy = null;

  try {
    const existingProducto = await ProductoModel.findById(id);

    if (!existingProducto) {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    if (data.category !== undefined) {
      const activeCategory = await CategoriaModel.findOne({
        _id: data.category,
        active: true,
      });

      if (!activeCategory) {
        throw new NotFoundError("Category not found or inactive", "CATEGORY_NOT_FOUND");
      }
    }

    const updatedProducto = await ProductoModel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedProducto) {
      throw new ApiError("An error has occurred during product updating", 500, "PRODUCT_NOT_UPDATED");
    }

    imageToDestroy = data.imagePublicId
      ? existingProducto.imagePublicId
      : null;

    return updatedProducto;
  } catch (error) {
    imageToDestroy = data.imagePublicId ?? null;

    if (error?.name === "CastError") {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    if (error instanceof NotFoundError) {
      throw error;
    }

    translateMongooseError(
      error,
      error?.code === 11000 ? "Product name is already registered" : "Invalid product data",
      error?.code === 11000 ? "PRODUCT_NAME_DUPLICATE" : "PRODUCT_INVALID",
    );
  } finally {
    await destroyCloudinaryImage(imageToDestroy);
  }
}

export async function deactivate(id) {
  try {
    const existingProducto = await ProductoModel.findById(id);

    if (!existingProducto) {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    const deactivatedProducto = await ProductoModel.findByIdAndUpdate(
      id,
      { active: false },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!deactivatedProducto) {
      throw new ApiError("An error has occurred during product deleting", 500, "PRODUCT_NOT_DEACTIVATED");
    }

    return deactivatedProducto;
  } catch (error) {
    if (error?.name === "CastError") {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    if (error instanceof NotFoundError) {
      throw error;
    }

    translateMongooseError(error, "Invalid product data", "PRODUCT_INVALID");
  }
}

export async function updateAvailability(id, available) {
  try {
    const updatedProducto = await ProductoModel.findByIdAndUpdate(
      id,
      { available },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedProducto) {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    return updatedProducto;
  } catch (error) {
    if (error?.name === "CastError") {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    if (error instanceof NotFoundError) {
      throw error;
    }

    translateMongooseError(error, "Invalid product data", "PRODUCT_INVALID");
  }
}

export async function getAll({
  skip = 0,
  limit = 20,
  category,
  available,
  active = true,
} = {}) {
  const filter = { active };

  if (category !== undefined) {
    if (typeof category !== "string" || !mongoose.isValidObjectId(category)) {
      return {
        data: [],
        pagination: {
          skip,
          limit,
          totalItems: 0,
        },
      };
    }

    filter.category = category;
  }

  if (available !== undefined) {
    filter.available = available;
  }

  const [data, totalItems] = await Promise.all([
    ProductoModel.find(filter)
      .populate({
        path: "category",
        select: "name description order active image imagePublicId",
      })
      .sort({ order: 1, name: 1, _id: 1 })
      .skip(skip)
      .limit(limit),
    ProductoModel.countDocuments(filter),
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
    const producto = await ProductoModel.findById(id).populate({
      path: "category",
      select: "name description order active image imagePublicId",
    });

    if (!producto) {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    return producto;
  } catch (error) {
    if (error?.name === "CastError") {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    throw error;
  }
}
