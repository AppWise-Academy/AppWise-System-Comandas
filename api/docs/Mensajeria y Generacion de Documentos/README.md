# Mensajería y Generación de Documentos

## 1. Introducción

En esta clase vamos a extender el backend del sistema de comandas para que pueda **comunicarse con servicios de terceros** y **generar archivos**, dos capacidades súper comunes en cualquier backend real:

- **Envío de correos**, con dos integraciones distintas (Nodemailer/SMTP y la API de Resend), usando templates HTML en vez de texto plano.
- **Generación de documentos** en el backend: un reporte de ventas en Excel (`.xlsx`) y el ticket de una comanda en PDF.

Todo esto sirve, además, como **preparación directa** para cuando integremos Mercado Pago: vamos a ver el mismo patrón (una integración externa, aislada en la capa `services`, con un controlador que no sabe ni le importa los detalles de esa integración) aplicado a algo más simple y visual primero.

Al final de la clase vas a poder probar todo desde **Postman**, sin necesidad de tocar el frontend.

---

## 2. Instalación de dependencias

Desde la carpeta `api/`, corré:

```bash
npm install nodemailer resend handlebars exceljs pdfkit
```

| Paquete      | Para qué lo usamos                                              |
| ------------ | ----------------------------------------------------------------|
| `nodemailer` | Enviar correos por SMTP clásico (Gmail, tu propio servidor, etc.)|
| `resend`     | Enviar correos a través de la API de Resend                     |
| `handlebars` | Motor de templates para armar el HTML de los correos            |
| `exceljs`    | Generar archivos `.xlsx` (reporte de ventas)                    |
| `pdfkit`     | Generar archivos `.pdf` (ticket de comanda)                     |

> ¿Por qué **Handlebars** y no EJS? Handlebars es "logic-less": el template solo puede mostrar datos (`{{variable}}`) e iterar/condicionar (`{{#each}}`, `{{#if}}`), pero no puede ejecutar JavaScript arbitrario. Esto **obliga** a que la lógica (calcular totales, formatear fechas, etc.) viva en el `service`, no mezclada en el HTML del correo. Además escapa el HTML por defecto, lo que evita inyección si algún dato viene de un usuario.

---

## 3. Variables de entorno

Copiá las siguientes variables a tu `.env` (ya están listadas, vacías, en `.env.example`):

```bash
# --- Nodemailer (SMTP) ---
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM_NAME=Sistema de Comandas
MAIL_FROM_EMAIL=no-reply@comandas.dev

# --- Resend ---
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Nodemailer: no necesitás credenciales para empezar

Si dejás `SMTP_HOST`, `SMTP_USER` y `SMTP_PASSWORD` vacíos, el servicio **crea automáticamente una cuenta de prueba en [Ethereal](https://ethereal.email)** la primera vez que se usa. Los correos no llegan a una bandeja real, pero la respuesta del endpoint te da un `previewUrl`: un link donde ves el correo renderizado tal cual se vería. Es la forma más rápida de probar el flujo completo sin pedirle a nadie una contraseña de Gmail.

Cuando quieras probar con un SMTP real (por ejemplo Gmail):

1. Activá la verificación en 2 pasos en tu cuenta de Google.
2. Generá una **contraseña de aplicación** (no uses tu contraseña normal).
3. Completá `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=tu-correo@gmail.com`, `SMTP_PASSWORD=<la contraseña de aplicación>`.

### Resend

1. Creá una cuenta gratuita en [resend.com](https://resend.com) y generá un API Key.
2. Pegalo en `RESEND_API_KEY`.

> ⚠️ **Importante**: con el remitente sandbox `onboarding@resend.dev` (el que viene por defecto, sin verificar un dominio propio), Resend **solo permite enviar correos a la casilla con la que te registraste**. Cualquier otro destinatario devuelve un error 403. No es un bug de nuestro código: es una restricción del plan gratuito de Resend. Para mandar a cualquier destinatario hay que verificar un dominio propio en su panel.

---

## 4. Paso a paso de la integración: ¿por qué todo esto vive en `services`?

La estructura de carpetas no cambia:

```
src/
├── config/
│   ├── nodemailer.config.js   # crea (una sola vez) el transporter SMTP
│   └── resend.config.js       # crea (una sola vez) el cliente de Resend
│
├── services/
│   ├── email.service.js       # sendMailSmtp, sendMailResend, sendEmail (dispatcher)
│   ├── excel.service.js       # generateSalesReport
│   └── pdf.service.js         # generateOrderTicket
│
├── controllers/
│   ├── email.controller.js
│   └── document.controller.js
│
├── routes/
│   ├── mail.js                 → se monta en /api/mail
│   └── documents.js            → se monta en /api/documents
│
├── schemas/
│   ├── mail.schema.js
│   └── document.schema.js
│
├── shared/
│   ├── templates/emails/       # welcome.hbs, order-confirmation.hbs
│   └── errors/
│       └── ExternalServiceError.js
│
└── utils/
    └── renderTemplate.js        # compila y cachea los .hbs
```

**La regla de oro:** el controlador nunca sabe *cómo* se manda un correo o *cómo* se arma un PDF. Solo le pide al service el resultado y decide qué hacer con la respuesta HTTP (JSON, o un archivo binario con sus headers).

Fijate en `email.service.js`: además de `sendMailSmtp` y `sendMailResend`, hay una función `sendEmail({ provider, ...payload })` que elige internamente qué proveedor usar:

```javascript
const providers = { smtp: sendMailSmtp, resend: sendMailResend };

async function sendEmail({ provider = "smtp", ...payload }) {
  const send = providers[provider];
  if (!send) throw new ValidationError(`Proveedor de email no soportado: "${provider}"`);
  return send(payload);
}
```

El controlador que usa `sendEmail` (`POST /api/mail/send`) **ni se entera** de si por debajo se usó Nodemailer o Resend. Este es exactamente el patrón que vamos a repetir cuando integremos Mercado Pago: un `payment.service.js` con un dispatcher `{ mercadopago: ..., stripe: ... }`, y controladores que solo dicen "cobrá esto", sin saber con qué pasarela.

También los `services` de Excel y PDF devuelven siempre un **`Buffer`** — nunca tocan `req`/`res`. Eso los hace reusables (por ejemplo, el día de mañana podrías adjuntar ese mismo PDF a un correo) y fáciles de probar sin levantar un servidor HTTP.

---

## 5. Guía de pruebas en Postman

Base URL local: `http://localhost:4000/api` (o el puerto que tengas en tu `.env`).

### 5.1. Enviar correo — Bienvenida por SMTP

```
POST /api/mail/smtp
Content-Type: application/json
```

```json
{
  "to": "alumno@example.com",
  "subject": "¡Bienvenido al sistema de comandas!",
  "template": "welcome",
  "data": {
    "name": "Juan"
  }
}
```

Respuesta esperada (200): incluye `previewUrl` si estás usando el fallback de Ethereal — abrí ese link en el navegador para ver el correo.

### 5.2. Enviar correo — Confirmación de comanda por Resend

```
POST /api/mail/resend
Content-Type: application/json
```

```json
{
  "to": "tu-correo-registrado-en-resend@example.com",
  "subject": "Tu comanda fue recibida 🧾",
  "template": "order-confirmation",
  "data": {
    "customerName": "Juan",
    "orderNumber": 101,
    "table": 5,
    "items": [
      { "name": "Milanesa napolitana", "quantity": 2, "price": 4500 },
      { "name": "Coca-Cola 500ml", "quantity": 2, "price": 1200 }
    ],
    "total": 11400,
    "estimatedTime": "20-25 min"
  }
}
```

> Recordá la restricción del sandbox de Resend: `to` tiene que ser el mismo email con el que te registraste, salvo que hayas verificado un dominio propio.

### 5.3. Enviar correo — endpoint unificado

```
POST /api/mail/send
Content-Type: application/json
```

```json
{
  "provider": "smtp",
  "to": "alumno@example.com",
  "subject": "Probando el dispatcher",
  "template": "welcome",
  "data": { "name": "Ana" }
}
```

Cambiá `"provider": "smtp"` por `"provider": "resend"` y volvé a mandar la misma request: es el mismo body, pero cambia el camino interno.

### 5.4. Generar reporte de ventas (Excel)

```
POST /api/documents/excel/sales-report
Content-Type: application/json
```

```json
{
  "orders": [
    {
      "orderNumber": 101,
      "table": 5,
      "waiter": "Juan Pérez",
      "items": [
        { "name": "Milanesa napolitana", "quantity": 2, "price": 4500 },
        { "name": "Coca-Cola 500ml", "quantity": 2, "price": 1200 }
      ],
      "total": 11400,
      "status": "pagado",
      "date": "2026-08-10T20:15:00Z"
    },
    {
      "orderNumber": 102,
      "table": 3,
      "waiter": "Ana Gómez",
      "items": [{ "name": "Pizza muzzarella", "quantity": 1, "price": 6800 }],
      "total": 6800,
      "date": "2026-08-10T20:30:00Z"
    }
  ]
}
```

### 5.5. Generar ticket de comanda (PDF)

```
POST /api/documents/pdf/ticket
Content-Type: application/json
```

```json
{
  "orderNumber": 101,
  "table": 5,
  "waiter": "Juan Pérez",
  "items": [
    { "name": "Milanesa napolitana", "quantity": 2, "price": 4500 },
    { "name": "Coca-Cola 500ml", "quantity": 2, "price": 1200 }
  ],
  "total": 11400,
  "date": "2026-08-10T20:15:00Z"
}
```

### ⚠️ Muy importante para ver los archivos en Postman

`/api/documents/excel/sales-report` y `/api/documents/pdf/ticket` **no devuelven JSON**, devuelven el archivo binario. Si apretás el botón "Send" normal, Postman te va a mostrar la respuesta como texto ilegible (bytes crudos) y vas a pensar que algo está roto.

En vez de "Send", usá la flechita de al lado y elegí **"Send and Download"**. Postman te va a pedir dónde guardar el archivo — abrilo con Excel o un lector de PDF para ver el resultado real.

### Otro detalle a tener en cuenta

El body parser global (`app.js`) está limitado a `10kb` (`express.json({ limit: "10kb" })`). Si armás un reporte de ventas con muchas comandas y el body supera ese límite, vas a recibir un error 500 genérico en vez de uno de validación. Para la clase alcanza con pocas comandas de ejemplo; si necesitás mandar reportes grandes, subí el límite en `app.js`.

---

## 6. Clases de error involucradas

Se agregó una nueva clase de error, siguiendo el mismo patrón que ya usa el proyecto (`ApiError` → clases específicas):

```javascript
// shared/errors/ExternalServiceError.js
export class ExternalServiceError extends ApiError {
  constructor(message = "Error al comunicarse con un servicio externo", code = null) {
    super(message, 502, code);
  }
}
```

Se usa cuando la falla no es "culpa" del cliente (no es un 400 de validación) sino de un servicio de terceros: SMTP caído, credenciales de Resend inválidas, etc. El `errorHandler` global la formatea igual que cualquier otro `ApiError`, sin que haya que tocar nada ahí.

---

## 7. Tecnologías utilizadas

- Nodemailer (SMTP) + Ethereal (cuentas de prueba)
- Resend (API de correo transaccional)
- Handlebars (templates de email)
- ExcelJS (`.xlsx`)
- PDFKit (`.pdf`)
- Zod (validación, mismo patrón que el resto de la API)
