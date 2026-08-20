import { ErrorResponse } from "../shared/responses/ErrorResponse.js";

export const roleGuard = (rolesPermitidos) => {
  return (req, res, next) => {
    // req.user viene del authGuard
    if (!req.user || !req.user.rol) {
      const error = new ErrorResponse(
        "Usuario no autenticado o rol no definido",
        401,
        null,
        req.originalUrl,
      );
      return res.status(401).json(error);
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      const error = new ErrorResponse(
        "No tienes permisos de Administrador para realizar esta acción",
        403,
        null,
        req.originalUrl,
      );
      return res.status(403).json(error);
    }

    next();
  };
};
