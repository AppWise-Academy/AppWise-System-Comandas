import { Router } from "express";
import {
  createCategoria,
  deleteCategoria,
  updateCategoria,
  getCategoriaById,
  getAllCategorias,
} from "../controllers/categoria.controller.js";
import {
  createProducto,
  deleteProducto,
  getAllProductos,
  getProductoById,
  updateProducto,
} from "../controllers/producto.controller.js";
import { uploadCategoriaImage } from "../middlewares/uploadImage.js";
import { uploadProductoImage } from "../middlewares/uploadImage.js";

const router = Router();

// Todo: agregar authGuard y rol requerido: admin
router.post("/categorias", uploadCategoriaImage, createCategoria);
router.put("/categorias/:id", uploadCategoriaImage, updateCategoria);
router.delete("/categorias/:id", deleteCategoria);
router.get("/categorias", getAllCategorias);
router.get("/categorias/:id", getCategoriaById);
router.post("/productos", uploadProductoImage, createProducto);
router.put("/productos/:id", uploadProductoImage, updateProducto);
router.delete("/productos/:id", deleteProducto);
router.get("/productos", getAllProductos);
router.get("/productos/:id", getProductoById);

export default router;
