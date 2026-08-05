import { Router } from "express";
import { registerController } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import { createUserSchema } from "../schemas/user.schema.js";

const router = Router();

router.post("/register", validate(createUserSchema), registerController);

export default router;
