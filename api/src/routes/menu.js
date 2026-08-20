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
  updateProductoAvailability,
  updateProducto,
} from "../controllers/producto.controller.js";
import { getCarta, getMasVendidos } from "../controllers/menu.controller.js";
import authGuard from "../middlewares/authGuard.js";
import roleGuard from "../middlewares/roleGuard.js";
import { uploadCategoriaImage } from "../middlewares/uploadImage.js";
import { uploadProductoImage } from "../middlewares/uploadImage.js";

const router = Router();

router.post("/categorias", authGuard, roleGuard("admin"), uploadCategoriaImage, createCategoria);
router.put("/categorias/:id", authGuard, roleGuard("admin"), uploadCategoriaImage, updateCategoria);
router.delete("/categorias/:id", authGuard, roleGuard("admin"), deleteCategoria); 
router.get("/categorias", getAllCategorias);
router.get("/categorias/:id", getCategoriaById);

router.post("/productos", authGuard, roleGuard("admin"), uploadProductoImage, createProducto);
router.put("/productos/:id", authGuard, roleGuard("admin"), uploadProductoImage, updateProducto);
router.put("/productos/:id/disponible", authGuard, roleGuard("admin", "cocina"), updateProductoAvailability);
router.delete("/productos/:id", authGuard, roleGuard("admin"), deleteProducto);
router.get("/productos", getAllProductos);
router.get("/productos/:id", getProductoById);

router.get("/carta", getCarta);
router.get("/mas-vendidos", getMasVendidos);

export default router;
