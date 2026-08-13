import { Router } from "express";
import {
  createCategoria,
  getCategoriaById,
  getAllCategorias,
} from "../controllers/categoria.controller.js";
import { uploadCategoriaImage } from "../middlewares/uploadImage.js";

const router = Router();

// Todo: agregar authGuard y rol requerido: admin
router.post("/categorias", uploadCategoriaImage, createCategoria);
router.get("/categorias", getAllCategorias);
router.get("/categorias/:id", getCategoriaById);

export default router;
