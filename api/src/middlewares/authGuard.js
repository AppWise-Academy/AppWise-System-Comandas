import jwt from "jsonwebtoken";
import { ErrorResponse } from "../shared/responses/ErrorResponse.js";

export const authGuard = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new ErrorResponse(
        "No token provided",
        401,
        null,
        req.originalUrl,
      );
      return res.status(401).json(error);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_de_prueba",
    );

    req.user = decoded;

    next();
  } catch (error) {
    const authError = new ErrorResponse(
      "No autorizado / Token inválido",
      401,
      null,
      req.originalUrl,
    );
    return res.status(401).json(authError);
  }
};
