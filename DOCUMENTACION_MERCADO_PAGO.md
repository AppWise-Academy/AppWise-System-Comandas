# Integración con Mercado Pago (SDK v2) — Guía para la clase

> PoC didáctica para el módulo de pagos de **Comandas**. No toca la base de
> datos: usa datos **mockeados** de un lado (backend) y del otro (frontend)
> para que el foco esté 100% en el flujo de integración, no en el modelado
> de datos.

Stack: **Node.js + Express** (backend) · **React + Vite + TypeScript**
(frontend) · **Socket.io** (tiempo real) · **Mercado Pago SDK v2**
(paquete npm `mercadopago`).

---

## 1. El flujo completo, de punta a punta

Antes de tocar código, es fundamental que quede clarísimo QUIÉN le habla
a QUIÉN en cada paso. Hay dos caminos que **nunca se cruzan**: el camino
del navegador del cliente (redirects) y el camino servidor-a-servidor
(webhook). Confundirlos es el error #1 que comete todo el mundo la
primera vez que integra un pago online.

```
 PASOS 1-3: arrancar el pago                    PASO 4: Mercado Pago abre DOS
 (front pide, back crea, front redirige)        caminos en paralelo, sin relación
                                                 entre sí más que "el mismo pago"

┌──────────┐  1. click "Generar Pago"   ┌──────────┐
│ FRONTEND │ ──────────────────────────▶│ BACKEND  │
│ Caja.tsx │                            │ (Express)│
└──────────┘                            └────┬─────┘
     │                                        │ 2. crea la Preferencia
     │ 3. redirige el NAVEGADOR               │    (Preference.create)
     │    a preference.init_point             ▼
     ▼                                  ┌──────────────┐
┌──────────────┐                        │ MERCADO PAGO │
│  CHECKOUT DE │◀───────────────────────│    (API)     │
│  MERCADO PAGO│  devuelve init_point   └──────┬───────┘
└──────┬───────┘                               │
       │  el cliente paga (o cancela) ─────────┘
       │
       ├─────────────────────────────┬─────────────────────────────┐
       │ CARRIL A — NAVEGADOR         │ CARRIL B — SERVIDOR-A-SERVIDOR
       │ (solo estética)              │ (fuente de la verdad)
       ▼                              ▼
┌──────────────────┐          ┌──────────────┐  5. POST notification_url
│ FRONTEND           │          │ MERCADO PAGO │ ────────────────────────▶ ┌──────────┐
│ /checkout/success   │          │  (webhook)   │                          │ BACKEND  │
│ /checkout/failure   │          └──────────────┘                          │(webhook  │
│ /checkout/pending   │                                                    │controller)│
└─────────────────────┘                                                   └────┬─────┘
   4a. redirect a la                                                            │ 6. Payment.get(id)
   back_url correspondiente                                                     │    "¿qué pasó REALMENTE
   (success/failure/pending)                                                    │     con este pago?"
                                                                                 ▼
                                                                        io.emit("payment_success")
                                                                                 │
                                                                                 │ 7. socket.on("payment_success")
                                                                                 ▼
                                                                        ┌──────────────┐
                                                                        │ FRONTEND     │
                                                                        │ Caja.tsx     │
                                                                        │ (alerta en   │
                                                                        │ tiempo real) │
                                                                        └──────────────┘
```

**Los pasos, en texto:**

1. El usuario (cajero) hace click en "Generar Pago" en el `Caja.tsx`.
2. El frontend le pide al **backend** que cree una preferencia
   (`POST /api/payments/create-preference`). El backend es quien decide
   el precio real (nunca confiamos en un monto mandado por el cliente) y
   arma la preferencia contra la API de Mercado Pago.
3. Mercado Pago devuelve un `init_point` (URL del Checkout). El frontend
   redirige el **navegador** del usuario ahí. A partir de acá, el usuario
   está en un dominio de `mercadopago.com`, no en nuestra app.
4. El usuario paga (o cancela, o elige un medio que queda pendiente).
   Mercado Pago hace **dos cosas en paralelo, de forma independiente**:
   - **4a.** Redirige el **navegador** de vuelta a una de nuestras
     `back_urls` (`success`, `failure` o `pending`), según el resultado.
   - **4b.** Le pega un **webhook** (`POST`) a nuestro `notification_url`,
     un endpoint del **backend**. Esto pasa server-to-server: el navegador
     del usuario no tiene nada que ver acá, y de hecho puede pasar
     ANTES, DESPUÉS o casi al mismo tiempo que el redirect del punto 4a.
5. El backend recibe el webhook (`POST /api/payments/webhook`). **No
   confía en el body de la notificación**: usa el ID de pago que le
   llegó para volver a preguntarle a la API de Mercado Pago (`Payment.get`)
   "¿qué estado tiene este pago REALMENTE?"
   (`payment.service.js → procesarNotificacionPago`).
6. Si el pago está aprobado, el backend actualiza sus datos (en esta PoC,
   el array mock) y emite un evento de Socket.io:
   `io.emit("payment_success", {...})`.
7. El frontend (`Caja.tsx`), que está escuchando ese evento desde que se
   montó el componente, recibe la notificación **en tiempo real** y
   muestra la alerta — sin que nadie haya recargado la página.

> 🔑 **La idea fuerza de toda la clase:** la pantalla de "éxito" que ve el
> usuario (paso 4a) es puramente estética. La fuente de la verdad de que
> un pago se acreditó es **siempre** el webhook (pasos 4b-5-6), porque es
> el único canal que no depende de qué hace o deja de hacer el navegador
> del cliente.

---

## 2. `back_urls`: success, failure, pending

Cuando creamos la preferencia (`payment.service.js`), le mandamos a
Mercado Pago un objeto `back_urls` con tres rutas de **nuestro
frontend**:

```js
back_urls: {
  success: `${frontendUrl}/checkout/success`,
  failure: `${frontendUrl}/checkout/failure`,
  pending: `${frontendUrl}/checkout/pending`,
},
auto_return: "approved",
```

| back_url  | Cuándo redirige Mercado Pago acá                                          |
|-----------|-----------------------------------------------------------------------------|
| `success` | El pago fue aprobado (tarjeta de crédito/débito, dinero en cuenta, etc.)   |
| `failure` | El pago fue rechazado, o el usuario canceló el Checkout                    |
| `pending` | El medio de pago elegido no se acredita al instante (efectivo, transferencia) |

Puntos clave para la clase:

- Son las **3 obligatorias** si querés que Mercado Pago pueda redirigir
  siempre, sin importar el resultado. Si falta alguna, MP puede dejar al
  usuario "varado" en su propio Checkout sin volver a tu sitio.
- `auto_return: "approved"` le dice a Mercado Pago que, **solo** cuando
  el pago se aprueba al instante, redirija automáticamente sin esperar
  que el usuario haga click en "Volver al sitio". Con pagos pendientes,
  MP siempre muestra su propia pantalla de "pendiente" primero — por eso
  `auto_return` no tiene un equivalente para `pending`.
- Cada una de estas rutas es una página del **frontend**, no del
  backend. Son puramente presentacionales (ver `Success.tsx`,
  `Failure.tsx`, `Pending.tsx`).
- Mercado Pago le agrega parámetros por **query string** a la URL de
  destino (`payment_id`, `status`, `external_reference`, etc). Están
  buenos para mostrarle feedback al usuario, pero **nunca** se deben usar
  para decidir lógica de negocio (ej: "marcar la mesa como pagada"): esa
  decisión la toma el webhook, que es un canal muchísimo más confiable
  (nadie puede forzar una URL de éxito a mano y hacerse pasar por un pago
  real... pero SÍ podría entrar directo a `/checkout/success` sin haber
  pagado un peso).

### `notification_url` (el webhook) — no es una back_url

Es fácil confundirla con las `back_urls` porque también se configura al
crear la preferencia, pero es conceptualmente otra cosa:

```js
notification_url: `${backendUrl}/api/payments/webhook`,
```

- Le pega **Mercado Pago**, no el navegador del usuario.
- Apunta al **backend**, no al frontend.
- Es la única fuente confiable de verdad sobre el estado real de un pago.

---

## 3. ⚠️ Nota: necesitás un túnel (ngrok) para probar el webhook en local

Este es el punto que más fricción genera la primera vez, así que quede
bien claro por escrito:

> Los servidores de Mercado Pago viven en **internet**. Tu backend, en
> desarrollo, vive en `http://localhost:4000`, un puerto que solo existe
> dentro de **tu propia PC**. Mercado Pago no tiene ninguna forma de
> llegar hasta ahí — "localhost" para ellos no significa nada, o peor,
> podría significar "su propio servidor" y fallar en silencio.

Por eso, **si `BACKEND_URL` en tu `.env` apunta a `localhost`, el webhook
nunca te va a llegar** cuando pruebes con Mercado Pago real (ni sandbox
ni producción). El `create-preference` va a funcionar igual (esa parte sí
es un fetch normal, tu PC → internet), pero vas a pagar en el Checkout y
tu backend jamás se va a enterar.

La solución en clase es exponer tu backend local con un **túnel** (por
ejemplo [ngrok](https://ngrok.com)), que te da una URL pública en
`https://algo.ngrok-free.app` que reenvía el tráfico a tu
`localhost:4000`. Esa URL pública es la que tenés que poner en
`BACKEND_URL` del `.env` mientras estés probando webhooks en vivo.

**Esto se explica y se hace en vivo durante la clase** (instalación de
ngrok, cómo levantarlo, cómo copiar la URL) — acá solo queda la
advertencia para que nadie se quede pensando "¿por qué no me llega
nunca el webhook?" sin saber que es justamente por esto.

> 💡 **Otro efecto secundario del túnel** (ngrok, Cloudflare Tunnel, etc):
> apenas alguna requests empieza a pasar por él, vas a ver este warning
> en la consola del backend:
> `ValidationError: The 'X-Forwarded-For' header is set but the Express
> 'trust proxy' setting is false...`. **No es un error que rompa nada**
> (el server sigue respondiendo 200 normalmente), pero conviene
> arreglarlo: significa que `express-rate-limit` no puede distinguir la
> IP real de cada cliente detrás del túnel. Ya está solucionado en
> `app.js` con `app.set("trust proxy", 1)` — queda documentado acá para
> que sepan qué warning es ese la primera vez que lo vean.

---

## 4. Arquitectura de archivos de la PoC

```
api/src/
├── config/
│   ├── mercadopago.config.js   # Inicialización del SDK v2 (MercadoPagoConfig)
│   └── socket.config.js        # Setup de Socket.io (singleton)
├── schemas/
│   └── payment.schema.js       # Validación con Zod del body de create-preference
├── services/
│   └── payment.service.js      # Lógica: crear preferencia + procesar webhook + emitir evento
├── controllers/
│   └── payment.controller.js   # HTTP: recibe el request, llama al service, responde
└── routes/
    └── payments.js             # Monta /api/payments/create-preference y /webhook

client/src/
├── lib/socket.ts                # Singleton del cliente de Socket.io
├── api/payments.ts              # fetch real (NO mockeado) contra el backend
└── pages/
    ├── Caja.tsx                 # Botón "Generar Pago" + escucha payment_success
    └── checkout/
        ├── Success.tsx
        ├── Failure.tsx
        └── Pending.tsx
```

Se respeta la misma arquitectura en capas que ya usa el resto de la API
(mail, documentos): **routes → controllers → services**. El controller no
sabe nada de Mercado Pago; el service no sabe nada de Express. El día que
conectemos la base de datos real, **solo cambia `payment.service.js`**
(el `MESAS_MOCK` en memoria pasa a ser una colección de Mongo) — el resto
de las capas queda intacto.

---

## 5. Cómo correr la PoC

1. **Backend** (`/api`):
   - Completá `MP_ACCESS_TOKEN` en `.env` con tu Access Token de PRUEBA
     (panel de developers de Mercado Pago).
   - `npm run dev`
2. **Frontend** (`/client`):
   - Revisá que `VITE_API_URL` y `VITE_SOCKET_URL` apunten a tu backend
     (por defecto `http://localhost:4000`).
   - `npm run dev`
3. Entrá como usuario con rol `cajero` o `admin`, andá a **Caja**, elegí
   una mesa y hacé click en **Generar Pago**.
4. Pagá en el Checkout con una [tarjeta de
   prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/additional-content/your-integrations/test/cards).
5. Sin túnel activo, vas a llegar a `/checkout/success` igual (eso es el
   redirect del navegador, paso 4a), pero la alerta en tiempo real de
   `Caja.tsx` **no va a aparecer** hasta que actives ngrok y el webhook
   pueda llegar (paso 4b-5-6). Es la mejor forma de que la clase vea, en
   carne propia, por qué son dos caminos distintos.

### Troubleshooting: probá `create-preference` sola, antes de la clase

Esta PoC fue probada de punta a punta salvo un tramo: los pasos que
requieren un Access Token real de Mercado Pago (crear la preferencia
contra la API de verdad, y consultar un pago) no se pudieron ejecutar sin
credenciales. Antes de la clase, con tu `MP_ACCESS_TOKEN` de prueba
cargado, corré esto para descartar el error más común:

```bash
curl -s -X POST http://localhost:4000/api/payments/create-preference \
  -H "Content-Type: application/json" -d '{"mesaId":"m1"}'
```

Si la respuesta trae un error mencionando **`auto_return`** o
**`back_urls`** (algo como *"auto_return invalid. back_url.success must be
defined"*), es porque Mercado Pago validó `back_urls.success` como URL y,
en algunas cuentas/API versions, rechaza una `back_url` con `localhost`
cuando `auto_return` está seteado. Si te pasa:

- Sacá `auto_return: "approved"` de `payment.service.js` mientras probás
  en local (el usuario va a necesitar hacer click en "Volver al sitio"
  en vez de que redirija solo), **o**
- Usá la URL pública de ngrok también para `FRONTEND_URL` (exponiendo el
  puerto de Vite con un segundo túnel), si querés mantener `auto_return`.

Si la respuesta viene con `preferenceId`, `initPoint` y `sandboxInitPoint`,
la integración con la API de MP está funcionando — a partir de ahí, el
resto del flujo (Checkout, back_urls, webhook) es exactamente lo descripto
arriba.
