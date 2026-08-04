import { validationResult } from "express-validator"

export function validateInput(req, res, next) {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }

  // si no hay errores, continua la peticion
  next();
}

