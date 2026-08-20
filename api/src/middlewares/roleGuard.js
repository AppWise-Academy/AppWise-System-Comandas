// Verifica que el usuario tiene el rol requerido.
// Se usa SIEMPRE después de authGuard.

function roleGuard(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "No autenticado" });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        error: `Requiere uno de estos roles: ${rolesPermitidos.join(", ")}`,
        tuRol: req.user.rol,
      });
    }

    next();
  };
}

export default roleGuard;
