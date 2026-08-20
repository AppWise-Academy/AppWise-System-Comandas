import CategoriaModel from "../models/Categoria.js";
import ProductoModel from "../models/Producto.js";
import ApiError from "../shared/errors/ApiError.js";

const productSorts = {
  orden: { order: 1, name: 1, _id: 1 },
  nombre: { name: 1, order: 1, _id: 1 },
  precio: { price: 1, name: 1, _id: 1 },
};

const bestSellingProjection = "name description category price image sold";
const categoryProjection = "name description order active image imagePublicId";

export async function getActiveMenu(orderBy = "orden") {
  const categories = await CategoriaModel.find({ active: true })
    .select("name description order image")
    .sort({ order: 1, name: 1, _id: 1 })
    .lean();

  if (categories.length === 0) {
    return [];
  }

  const categoryIds = categories.map(({ _id }) => _id);
  const products = await ProductoModel.find({
    category: { $in: categoryIds },
    active: true,
    available: true,
  })
    .select("name description category price image order")
    .sort(productSorts[orderBy])
    .lean();

  const productsByCategory = new Map();

  for (const product of products) {
    const categoryId = String(product.category);
    const categoryProducts = productsByCategory.get(categoryId) ?? [];
    categoryProducts.push(product);
    productsByCategory.set(categoryId, categoryProducts);
  }

  return categories.map((category) => ({
    ...category,
    products: productsByCategory.get(String(category._id)) ?? [],
  }));
}

export async function getBestSelling({ limit = 10, period } = {}) {
  if (period) {
    // Todo: esperar la integración de la issue #13 para resolver rankings temporales.
    throw new ApiError(
      "Temporal best-selling ranking is not available yet",
      501,
      "TEMPORAL_RANKING_UNAVAILABLE",
    );
  }

  return ProductoModel.find({ active: true })
    .select(bestSellingProjection)
    .populate({
      path: "category",
      select: categoryProjection,
    })
    .sort({ sold: -1, _id: 1 })
    .limit(limit)
    .lean();
}
