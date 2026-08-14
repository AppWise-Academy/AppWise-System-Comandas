import CategoriaModel from "../models/Categoria.js";
import ProductoModel from "../models/Producto.js";
import { NotFoundError } from "../shared/errors/index.js";
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

const categoryPopulate = {
  path: "category",
  select: "name description order active image imagePublicId",
};

export async function getAll({
  skip = 0,
  limit = 20,
  category,
  available,
  active = true,
} = {}) {
  const filter = { active };

  if (category !== undefined) {
    filter.category = category;
  }

  if (available !== undefined) {
    filter.available = available;
  }

  const [data, totalItems] = await Promise.all([
    ProductoModel.find(filter)
      .populate(categoryPopulate)
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
    const producto = await ProductoModel.findById(id).populate(categoryPopulate);

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
