import CategoriaModel from "../models/Categoria.js";
import ProductoModel from "../models/Producto.js";

const productSorts = {
  orden: { order: 1, name: 1, _id: 1 },
  nombre: { name: 1, order: 1, _id: 1 },
  precio: { price: 1, name: 1, _id: 1 },
};

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
