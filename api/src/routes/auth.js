import { Router } from "express";
import { registerController, loginController } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import { createUserSchema } from "../schemas/user.schema.js";

const router = Router();

router.post("/register", validate(createUserSchema), registerController);
router.post("/login", loginController);

export default router;
