import jwt from "jsonwebtoken";

function authGuard(req, res, next) {

  // 1- leer el header authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      error: "Token requerido. Envia: Authorozation: Bearer TOKEN",
    });
  }

  // 2. Extraer el token
  const token = authHeader.split(" ")[1];

  //3. Verificar el token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // {userId, email, rol, iat, exp}
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        ok:false,
        error: "Token Expirado",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      ok: false,
      error: "Token inválido",
      code: "TOKEN_INVALID",
    });
  }
}

export default authGuard;
