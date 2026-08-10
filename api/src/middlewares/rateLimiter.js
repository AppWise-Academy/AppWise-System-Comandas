import rateLimit from "express-rate-limit";
import { TooManyRequestsError } from "../shared/errors/TooManyRequestsError.js";

//le pasamos el error al errorHandler global en vez de armar la respuesta acá,
//asi el formato sale siempre por el mismo lugar (ErrorResponse)
function tooManyRequestsHandler(req, res, next) {
  next(new TooManyRequestsError("Demasiadas peticiones. Intenta de nuevo mas tarde"));
}

export const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS),

  standardHeaders: true,
  legacyHeaders: false,

  handler: tooManyRequestsHandler,
})

export const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX),

  skipSuccessfulRequests: true, //solo cuentan los intentos fallidos

  standardHeaders: true,
  legacyHeaders: false,

  handler: tooManyRequestsHandler,
})