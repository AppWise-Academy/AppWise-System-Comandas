import UserModel from "../models/User.js";
import ApiError from "../shared/apiError.js";
import {generarToken} from "../shared/generarToken.js"

async function register({ name, email, password }) {
  const exist = await UserModel.findOne({ email });
  if (exist)
    throw ApiError.conflict("El email ya está registrado", "EMAIL_DUPLICADA");

  const user = await UserModel.create({ name, email, password });
  return { user };
}

async function login({email, password}) {
  const usuario = await UserModel.findOne({email}).select("+password");
  
  if(!usuario || !(await usuario.comparePassword(password)))
    throw ApiError.forbidden("El email o password errados","LOGIN_ERROR")

  const token = generarToken(usuario)
  console.log("paso 1")

  return {usuario, token}
}



async function refresh() {}
async function logout() {}
async function profile() {}

export { register, login };
