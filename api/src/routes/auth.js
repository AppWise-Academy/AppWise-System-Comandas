import { Router } from "express";
import { registerController, loginController } from "../controllers/user.controller.js";
import {validateInput} from "../middlewares/validateInput.js"
import { body } from "express-validator"
import { ROLES } from "../shared/constants.js" 

const router = Router();

router.post("/register",
  [
    body("name").trim().isLength({min:3, max:50}).withMessage("name debe contener minimo 3 y maximo 50 caracteres"),
    body("password").isLength({min:8}).withMessage("password debe contener minimo 8 caracteres"),
    body("rol").trim().toLowerCase().isIn(Object.values(  ROLES)).withMessage(`Rol no valido. los Roles permitidos son ${Object.values(ROLES).join(', ')}`),
    body("email").trim().isEmail().withMessage("email invalido")
  ],
  validateInput,
  registerController
);

router.post("/login",
  [
    body("email").trim().isEmail().withMessage("email invalido"),
    body("password").isLength({min:8}).withMessage("password debe contener minimo 8 caracteres"),    
  ],
  validateInput,
  loginController
);

export default router;
