import { Router } from "express";
import {
  createCategoria,
  getCategoriaById,
  getAllCategorias,
} from "../controllers/categoria.controller.js";
import { validate } from "../middlewares/validate.js";
import { createCategoriaSchema } from "../schemas/categoria.schema.js";

const router = Router();

// Todo: agregar authGuard y rol requerido: admin
router.post("/categorias", validate(createCategoriaSchema), createCategoria);
router.get("/categorias", getAllCategorias);
router.get("/categorias/:id", getCategoriaById);

export default router;
