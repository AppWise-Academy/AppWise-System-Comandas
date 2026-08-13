import { Router } from "express";
import {
  createCategoria,
  updateCategoria,
  getCategoriaById,
  getAllCategorias,
} from "../controllers/categoria.controller.js";
import { uploadCategoriaImage } from "../middlewares/uploadImage.js";

const router = Router();

// Todo: agregar authGuard y rol requerido: admin
router.post("/categorias", uploadCategoriaImage, createCategoria);
router.put("/categorias/:id", uploadCategoriaImage, updateCategoria);
router.get("/categorias", getAllCategorias);
router.get("/categorias/:id", getCategoriaById);

export default router;
