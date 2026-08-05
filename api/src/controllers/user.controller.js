import { register, login } from "../services/auth.service.js";
import ApiError from "../shared/errors/ApiError.js";
import { created, ok } from "../shared/apiResponse.js";

async function registerController(req, res) {
  try {
    const { name, email, password } = req.body;
    const data = await register({ name, email, password });
    created(res, data);
  } catch (error) {
    return res.status(error.status).json({
      msg: error.message,
      code: error.code
    })
    /* throw ApiError.internal; */
  }
}

async function loginController(req, res) {
  try {
    const {email, password} = req.body;
    const {usuario, token} = await login({email, password})
    ok(res, {usuario,token})    

  } catch (error) {
    return res.status(500).json({
      msg: error.message,
      code: error.code
    })
  }
  
}

export { registerController, loginController };
