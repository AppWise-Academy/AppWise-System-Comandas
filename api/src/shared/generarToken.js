import jwt from "jsonwebtoken"
import { SETTINGS_ENV } from "../settings/index.js"

export function generarToken(usuario){
  return jwt.sign(
    {
      userId: usuario._id.toString(),
      email: usuario.email,
      rol: usuario.rol,
    },
    /* process.env.JWT_SECRET */
    SETTINGS_ENV.jwt.secret,
    {
      /* expiresIn: process.env.JWT_EXPIRES_IN || "15m" */
      expiresIn: SETTINGS_ENV.jwt.expiresIn || "15m"
    },
  );
}