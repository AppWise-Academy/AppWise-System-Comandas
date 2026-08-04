import { register } from "../services/auth.service.js";
import ApiError from "../shared/errors/ApiError.js";
import { created } from "../shared/apiResponse.js";

async function registerController(req, res) {
  try {
    const { name, email, password } = req.body;

    const data = await register({ name, email, password });
    created(res, data);
  } catch (error) {
    ApiError.internal;
  }
}

export { registerController };
