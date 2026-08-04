import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS),

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Demasiadas peticiones. Intenta de nuevo mas tarde",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    })
  }
})

export const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX),

  skipSuccessfulRequests: true, //solo cuentan los intentos fallidos

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Demasiadas peticiones. Intenta de nuevo mas tarde",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    })
  }
})