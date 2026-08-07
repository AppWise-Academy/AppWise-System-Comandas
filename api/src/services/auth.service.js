import UserModel from "../models/User.js";
import { ConflictError } from "../shared/errors/ConflictError.js";

async function register({ name, email, password }) {
  const exist = await UserModel.findOne({ email });
  if (exist)
    throw new ConflictError("El email ya está registrado", "EMAIL_DUPLICADA");

  const user = await UserModel.create({ name, email, password });
  return { user };
}

async function login() {}
async function refresh() {}
async function logout() {}
async function profile() {}

export { register };
