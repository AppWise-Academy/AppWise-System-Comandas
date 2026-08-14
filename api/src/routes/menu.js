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
import { uploadCategoriaImage } from "../middlewares/uploadImage.js";
import { uploadProductoImage } from "../middlewares/uploadImage.js";

const router = Router();

// Todo: agregar permisos solo para el rol "admin"
router.post("/categorias", uploadCategoriaImage, createCategoria);
// Todo: agregar permisos solo para el rol "admin"
router.put("/categorias/:id", uploadCategoriaImage, updateCategoria);
// Todo: agregar permisos solo para el rol "admin"
router.delete("/categorias/:id", deleteCategoria);

router.get("/categorias", getAllCategorias);
router.get("/categorias/:id", getCategoriaById);

// Todo: agregar permisos solo para el rol "admin"
router.post("/productos", uploadProductoImage, createProducto);
// Todo: agregar permisos solo para el rol "admin"
router.put("/productos/:id", uploadProductoImage, updateProducto);
// Todo: agregar permisos solo para los roles "admin" y "cocina"
router.put("/productos/:id/disponible", updateProductoAvailability);
// Todo: agregar permisos solo para el rol "admin"
router.delete("/productos/:id", deleteProducto);

router.get("/productos", getAllProductos);
router.get("/productos/:id", getProductoById);

router.get("/carta", getCarta);
router.get("/mas-vendidos", getMasVendidos);

export default router;
