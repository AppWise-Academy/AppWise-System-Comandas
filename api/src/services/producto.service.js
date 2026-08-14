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
