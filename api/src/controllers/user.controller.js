import { register, login } from "../services/auth.service.js";
import { created, ok } from "../shared/apiResponse.js";

async function registerController(req, res) {
  const { name, email, password } = req.body;

  const data = await register({ name, email, password });
  created(res, data);
}

async function loginController(req, res) {

    const {email, password} = req.body;
    const {usuario, token} = await login({email, password})

    ok(res, {usuario,token})  
  
}

export { registerController, loginController };
