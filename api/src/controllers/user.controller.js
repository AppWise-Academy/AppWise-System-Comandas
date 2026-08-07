import { register } from "../services/auth.service.js";
import { created } from "../shared/apiResponse.js";

async function registerController(req, res) {
  const { name, email, password } = req.body;

  const data = await register({ name, email, password });
  created(res, data);
}

export { registerController };
