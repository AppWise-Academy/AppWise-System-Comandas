# Backend API - Arquitectura Base

## Descripción

Este módulo implementa la configuración base de la API utilizando Express, proporcionando una infraestructura reutilizable para todas las funcionalidades del proyecto.

La arquitectura incluye:

- Configuración global de middlewares.
- Seguridad HTTP mediante Helmet.
- Control de acceso mediante CORS.
- Limitación de solicitudes (Rate Limiting).
- Validación centralizada con Zod.
- Manejo global de errores.
- Logging de errores.
- Respuestas estandarizadas.

---

# Estructura implementada

```
src/
│
├── middlewares/
│   ├── cors.js
│   ├── helmet.js
│   ├── validate.js
│   ├── rateLimiter.js
│   └── errorHandler.js
│
├── shared/
│   └── errors/
│       ├── ApiError.js
│       ├── AuthError.js
│       ├── BadRequestError.js
│       ├── ConflictError.js
│       ├── ForbiddenError.js
│       ├── NotFoundError.js
│       ├── ValidationError.js
│       ├── TooManyRequestError.js
│       └── index.js
│
├── utils/
│   └── logger.js
│
├── schemas/
│   └── user.schema.js
│
└── app.js
```

---

# Middlewares implementados

## CORS

Se configuró el middleware `cors` utilizando una lista de orígenes permitidos definida mediante variables de entorno.

Características:

- Soporte para múltiples orígenes.
- Soporte para credenciales.
- Configuración mediante:

```
ALLOWED_ORIGINS
```

Ejemplo:

```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Helmet

Se utiliza Helmet para agregar automáticamente headers de seguridad.

Entre ellos:

- X-Frame-Options
- X-Content-Type-Options
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- Referrer-Policy

También se deshabilita el header:

```
X-Powered-By
```

---

## Rate Limiter

Se implementaron dos limitadores.

### Global

Aplicado a toda la aplicación.

Configuración mediante:

```
RATE_LIMIT_WINDOW_MS
RATE_LIMIT_MAX_REQUESTS
```

---

### Auth

Aplicado únicamente a las rutas de autenticación.

Configuración mediante:

```
AUTH_RATE_LIMIT_MAX
```

Se encuentra preparado para proteger rutas como:

```
POST /api/auth/login
POST /api/auth/register
```

---

## Validación

Se implementó un middleware reutilizable utilizando Zod.
Se usan 2 argumentos: El primero es el schema a comparar, y el segundo el tipo de recurso a validar, por default es el body, pero tambien permite validar params y query.

Ejemplo:

```javascript
router.post(
    "/register",
    validate(createUserSchema),
    registerController
);
```

En caso de error devuelve una respuesta HTTP 400 con el detalle de los campos inválidos.

---

## Error Handler

Se implementó un manejador global de errores.

Responsabilidades:

- Capturar excepciones no controladas.
- Transformar errores de Zod.
- Manejar errores personalizados.
- Evitar que la aplicación crashee.
- Registrar errores mediante el logger.

Formato estándar:

```json
{
    "success": false,
    "statusCode": 400,
    "message": "Descripción del error",
    "errors": {},
    "timestamp": "...",
    "path": "/ruta"
}
```

---

# Clases de error

Se implementaron errores personalizados:

- BadRequestError
- ValidationError (unauthorized)
- ForbiddenError
- NotFoundError
- ConflictError
- etc

Todos extienden de:

```
ApiError
```
Que a su vez, extiende de ``Error``.

---

# Logger

El sistema registra:

- Método HTTP.
- Ruta.
- Código de estado.
- Stack Trace de errores.
---

# Variables de entorno

```
NODE_ENV=

ALLOWED_ORIGINS=

RATE_LIMIT_WINDOW_MS=

RATE_LIMIT_MAX_REQUESTS=

AUTH_RATE_LIMIT_MAX=
```

---

# Respuestas estandarizadas

## Success

```json
{
    "success": true,
    "message": "Operación exitosa",
    "data": {},
    "timestamp": "..."
}
```

---

## Error

```json
{
    "success": false,
    "statusCode": 400,
    "message": "Error",
    "errors": {},
    "timestamp": "...",
    "path": "/ruta"
}
```

---

# Pruebas realizadas

Se incluye una colección de Postman con los siguientes casos:

- ✅ Petición exitosa (200)
- ✅ Error de validación (400)
- ✅ Rate Limit excedido (429)
- ✅ Error interno (500)

También se validan:

- Headers de seguridad.
- Headers CORS.
- Headers Rate Limit.
- Estructura estándar de respuestas.

---

# Cómo extender la arquitectura

## Agregar un nuevo Schema

Crear el schema dentro de:

```
src/schemas
```

Ejemplo:

```javascript
export const createProductSchema = ...
```

---

## Agregar validación

```javascript
router.post(
    "/products",
    validate(createProductSchema),
    createProductController
);
```

---

## Crear un nuevo Error

```javascript
class PaymentRequiredError extends ApiError {
    constructor(message = "Pago requerido") {
        super(message, 402);
    }
}
```

---

## Agregar nuevas rutas

Crear un archivo dentro de:

```
src/routes
```

El sistema de carga automática registrará la ruta sin necesidad de modificar `index.js`.

Ejemplo:

```
routes/products.js
```

↓

```
/api/products
```

---

# Tecnologías utilizadas

- Node.js
- Express
- Zod (request data validator)
- Helmet
- CORS
- express-rate-limit
- Winston (logger)