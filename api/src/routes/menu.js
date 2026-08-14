import { Router } from "express";
import {
  createCategoria,
  deleteCategoria,
  updateCategoria,
  getCategoriaById,
  getAllCategorias,
} from "../controllers/categoria.controller.js";
import { createProducto } from "../controllers/producto.controller.js";
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

export default router;
