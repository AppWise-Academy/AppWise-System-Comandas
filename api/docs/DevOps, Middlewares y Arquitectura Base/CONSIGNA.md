DevOps, Middlewares y Arquitectura Base
Descripción
Implementar la configuración central de app.js con todos los middlewares necesarios para garantizar seguridad, validación de datos, control de tasa de solicitudes y manejo global de errores sin que la aplicación se caiga.

Responsabilidades Principales
1. CORS (Control de Origen Cruzado)
Permitir orígenes específicos según ambiente (desarrollo, staging, producción)
Configuración flexible mediante variables de entorno
Soportar credenciales en peticiones cross-origin
2. Helmet (Seguridad HTTP)
Implementar headers de seguridad estándar (X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, etc.)
Deshabilitar header X-Powered-By
Protección contra XSS, clickjacking y otros ataques comunes
3. Validadores (Joi o Zod)
Middleware central para validación de request body, params y query
Mensajes de error claros y consistentes
Aplicable a través de decoradores o middleware reutilizable
4. Rate Limiters
Rate limiter global (p. ej., 100 requests / 15 minutos)
Rate limiter específico para rutas de autenticación (máx. 5 intentos / 15 minutos)
Usar express-rate-limit con store persistente (Redis opcional para escala)
5. Error Handler Global
Capturar todas las excepciones no manejadas
Convertir errores de validación Joi/Zod a respuestas HTTP consistentes
Respuestas estandarizadas: { success: boolean, message: string, data?: any, errors?: object }
Crítico: No debe permitir que la app se caiga; incluir logging y fallback responses



Modelos:
ErrorResponse (Estructura Estándar)
{
  success: false,
  message: "Descripción clara del error",
  statusCode: 400 | 401 | 403 | 404 | 409 | 429 | 500,
  errors?: {
    fieldName: ["Error 1", "Error 2"]
  },
  timestamp: ISO8601,
  path: "/ruta/del/error"
}
SuccessResponse (Estructura Estándar)
{
  success: true,
  message: "Operación exitosa",
  data: { /* payload */ },
  timestamp: ISO8601
}



Rutas y Middlewares:
Orden de Aplicación en app.js:

Body Parser (JSON, URL-encoded)
CORS
Helmet
Request Logger (opcional: Morgan)
Global Rate Limiter (100 req/15min)
Auth Rate Limiter (aplicar solo a /auth)
Validación Request (middleware)
Rutas de la aplicación
404 Handler
Error Handler Global


Implementación de Rate Limiter en Rutas de Autenticación:
// Aplicarse a POST /auth/login, /auth/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,                     // máx. 5 intentos
  message: "Demasiados intentos de acceso. Intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});



Criterios de Aceptación

CORS configurado correctamente según process.env.ALLOWED_ORIGINS

Helmet aplicado con configuración estándar de seguridad

Validación global funcionando para body, params y query (Joi o Zod)

Rate Limiter Global implementado (100 req/15 min)

Rate Limiter de Auth implementado (máx. 5 intentos en 15 min para /auth/login y /auth/register)

Error Handler Global captura todas las excepciones sin crashes:
Errores de validación retornan 400 con lista de errores
Errores no controlados retornan 500 con mensaje genérico (sin exponer detalles internos)
Todas las respuestas incluyen estructura estándar (success, message, data, errors, timestamp)

Logging de errores (winston, pino o similar) con contexto (ruta, método, stack trace)

Tests unitarios para middlewares y error handler (jest o mocha)

Documentación en README.md explicando la configuración y cómo extender middlewares




Notas Técnicas
Usar variables de entorno (.env) para configuración:

NODE_ENV (development, staging, production)
ALLOWED_ORIGINS (comma-separated)
RATE_LIMIT_WINDOW_MS
RATE_LIMIT_MAX_REQUESTS
AUTH_RATE_LIMIT_MAX
Implementar custom error classes (e.g., ValidationError, AuthError, NotFoundError) que extienda Error

Middleware de validación debe ser reutilizable:

const validate = (schema) => (req, res, next) => { /* ... */ }
// Uso: app.post('/ruta', validate(miSchema), handler)
Respuestas de error deben ser consistentes en toda la app




Obligatorio: Adjuntar Colección de Postman
Incluir archivo postman_collection.json con ejemplos que demuestren:

✅ Petición exitosa (200 con estructura success)
❌ Error de validación (400 con errores detallados)
⏱️ Rate Limit excedido (429 con mensaje claro)
❌ Error no controlado manejado (500 con fallback seguro)
🛡️ Headers de seguridad verificados (CORS, Helmet, X-Frame-Options, etc.)


Incluir tests en Postman que validen:

Estructura de respuesta (success, message, timestamp presentes)
Status codes correctos
Headers de seguridad presentes
Rate limit funcionando




Archivos a Crear/Modificar:
src/app.js - Configuración central
src/middleware/cors.js - CORS setup
src/middleware/helmet.js - Helmet setup
src/middleware/validation.js - Validación general
src/middleware/rateLimiter.js - Rate limiters
src/middleware/errorHandler.js - Error handler global
src/utils/errors.js - Custom error classes
src/utils/logger.js - Logger setup
.env.example - Variables de entorno necesarias
postman_collection.json - Colección con ejemplos
src/__tests__/middleware/ - Tests unitarios