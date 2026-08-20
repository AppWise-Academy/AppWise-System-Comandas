import { Router } from "express";
import {
  obtenerMesas,
  obtenerMesaPorId,
  crearMesa,
  editarMesa,
  eliminarMesa,
  abrirMesa,
  liberarMesa,
  obtenerCuenta,
  obtenerEstadisticas,
} from "../controllers/mesa.controller.js";

import { validate } from "../middlewares/validate.js";
import {
  createMesaSchema,
  updateMesaSchema,
  abrirMesaSchema,
  liberarMesaSchema,
} from "../schemas/mesa.schema.js";

import { authGuard } from "../middlewares/authGuard.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const router = Router();

router.use(authGuard);

router.get("/stats/resumen", obtenerEstadisticas);

// CRUD BASE
router.get("/", obtenerMesas);

router.post(
  "/",
  roleGuard(["admin"]), 
  validate(createMesaSchema),
  crearMesa,
);

router.get("/:id", obtenerMesaPorId);

router.put(
  "/:id",
  roleGuard(["admin"]),
  validate(updateMesaSchema),
  editarMesa,
);

router.delete("/:id", roleGuard(["admin"]), eliminarMesa);

router.post("/:id/abrir", validate(abrirMesaSchema), abrirMesa);

router.post("/:id/cuenta", obtenerCuenta);

router.post("/:id/liberar", validate(liberarMesaSchema), liberarMesa);

export default router;
