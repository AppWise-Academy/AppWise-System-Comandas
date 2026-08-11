import { Router } from "express";
import { createCategoria } from "../controllers/categoria.controller.js";
import { validate } from "../middlewares/validate.js";
import { createCategoriaSchema } from "../schemas/categoria.schema.js";

const router = Router();

// Todo: agregar authGuard y rol requerido: admin
router.post("/categorias", validate(createCategoriaSchema), createCategoria);

export default router;
