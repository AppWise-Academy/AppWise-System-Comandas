import {
  getPreferenceClient,
  getPaymentClient,
} from "../config/mercadopago.config.js";
import { getIO } from "../config/socket.config.js";
import { SETTINGS_ENV } from "../settings/index.js";
import { NotFoundError } from "../shared/errors/NotFoundError.js";
import { ExternalServiceError } from "../shared/errors/ExternalServiceError.js";
import { logger } from "../utils/logger.js";
// import { sendEmail } from "./email.service.js"; // 👈 lo usamos más abajo, comentado a propósito.

// ============================================================
// services/payment.service.js
// ------------------------------------------------------------
// Toda la lógica de Mercado Pago vive acá adentro. Ni el controller ni
// las rutas saben CÓMO se arma una preferencia o CÓMO se valida un pago:
// solo le piden al service "creame la preferencia de esta mesa" o
// "procesá esta notificación". Mismo principio que ya vimos en
// email.service.js.
//
// 🎓 IMPORTANTE (mock, sin DB): esta PoC no toca Mongo. En su lugar usamos
// un array en memoria como si fuera la tabla "mesas" de la base de datos.
// Se resetea cada vez que reiniciás el server. El día que conectemos la
// DB real, lo único que cambia es esta sección: en vez de `.find()` sobre
// un array vamos a hacer `Mesa.findById(mesaId)` con Mongoose. El resto
// del flujo (Preference, Payment, Socket.io) queda IGUAL.
// ============================================================

const MESAS_MOCK = [
  { id: "m1", numero: 1, total: 8500, pagada: false },
  { id: "m2", numero: 2, total: 15200, pagada: false },
  { id: "m3", numero: 3, total: 4300, pagada: false },
];

function buscarMesaMock(mesaId) {
  const mesa = MESAS_MOCK.find((m) => m.id === mesaId);
  if (!mesa) {
    throw new NotFoundError(
      `No existe una mesa mockeada con id "${mesaId}"`,
      "MESA_NOT_FOUND",
    );
  }
  return mesa;
}

/**
 * Crea una preferencia de pago (Checkout Pro) para la cuenta de una mesa.
 *
 * "Preferencia" es el nombre que le da Mercado Pago al objeto que describe
 * QUÉ se está cobrando (ítems, precio, moneda) y QUÉ hacer después
 * (back_urls, notification_url). Al crearla, MP nos devuelve un
 * `init_point`: la URL del Checkout donde el cliente ingresa la tarjeta.
 *
 * @param {{mesaId: string}} payload
 */
async function crearPreferenciaMesa({ mesaId }) {
  // 1) Buscamos el precio REAL en nuestro propio backend (mock por ahora).
  //    Nunca confiamos en un monto que venga del body del front: cualquiera
  //    con las devtools abiertas podría mandar `{ monto: 1 }` y pagar un
  //    peso por una cuenta de $8500 si dejáramos que el precio viaje desde
  //    el cliente. El front solo manda el ID; el precio lo decide el server.
  const mesa = buscarMesaMock(mesaId);

  const preferenceClient = getPreferenceClient();
  const { backendUrl, frontendUrl } = SETTINGS_ENV.urls;

  // Mercado Pago valida que `back_urls.success` sea una URL "real" cuando
  // mandamos `auto_return`, y rechaza la preferencia (400: "auto_return
  // invalid. back_url.success must be defined") si esa URL es localhost.
  // Tiene sentido: `auto_return` le pide a los SERVIDORES de Mercado Pago
  // que decidan redirigir solos, y ellos no tienen forma de saber si tu
  // "localhost" va a existir del otro lado. Por eso: si el FRONTEND_URL
  // todavía es localhost (clase sin tunelear el front), mandamos
  // `back_urls` igual —el redirect lo hace el NAVEGADOR del cliente, que
  // sí puede llegar a su propio localhost— pero omitimos `auto_return`,
  // así el usuario hace click en "Volver al sitio" a mano. Con el
  // frontend detrás de un túnel público, `auto_return` se activa solo.
  const frontendEsPublico = !/^https?:\/\/localhost/.test(frontendUrl);

  try {
    const preference = await preferenceClient.create({
      body: {
        // "items": el detalle de lo que se cobra. Podría tener varias
        // líneas (una por producto de la comanda); acá simplificamos a
        // una sola línea con el total de la mesa.
        items: [
          {
            id: mesa.id,
            title: `Mesa ${mesa.numero} — Comandas App`,
            quantity: 1,
            unit_price: mesa.total,
            currency_id: "ARS",
          },
        ],

        // "external_reference": el dato MÁS importante de todo el flujo.
        // Es un campo de texto libre que nosotros mandamos y que Mercado
        // Pago nos devuelve intacto en el pago y en el webhook. Es cómo
        // sabemos, cuando llega la notificación, A QUÉ MESA correspondía
        // ese pago (por eso mandamos el mesaId acá, y no el número visible).
        external_reference: mesa.id,

        // "back_urls": a dónde redirige Mercado Pago el NAVEGADOR del
        // cliente después de que interactúa con el Checkout. Son 3 rutas
        // del FRONTEND (no del backend), una por cada resultado posible.
        // Ver DOCUMENTACION_MERCADO_PAGO.md → sección "back_urls" para el
        // detalle de cada una.
        back_urls: {
          success: `${frontendUrl}/checkout/success`,
          failure: `${frontendUrl}/checkout/failure`,
          pending: `${frontendUrl}/checkout/pending`,
        },

        // "auto_return": con "approved", si el pago se aprueba al toque
        // (tarjeta de crédito/débito), Mercado Pago redirige solo, sin
        // esperar que el usuario haga click en "Volver al sitio". Con
        // pagos que quedan pendientes (efectivo, transferencia) esto no
        // aplica: ahí SIEMPRE se muestra la pantalla de "pendiente" de MP.
        // Ver `frontendEsPublico` más arriba: solo lo mandamos si
        // `back_urls.success` es una URL pública real.
        ...(frontendEsPublico && { auto_return: "approved" }),

        // "notification_url": la URL de nuestro BACKEND a la que Mercado
        // Pago le pega un POST cuando el estado del pago cambia. Es la
        // pieza que dispara el webhook. OJO: en local, "localhost" no le
        // sirve de nada a los servidores de Mercado Pago (ellos están en
        // internet, no en tu PC) — necesitás un túnel (ngrok). Ver la nota
        // en la documentación.
        notification_url: `${backendUrl}/api/payments/webhook`,
      },
    });

    logger.info({
      message: `Preferencia de MP creada para mesa ${mesa.numero}`,
      method: "SERVICE",
      path: "crearPreferenciaMesa",
    });

    return {
      preferenceId: preference.id,
      // "init_point": producción real. "sandbox_init_point": para probar
      // con las tarjetas de test de Mercado Pago sin mover dinero real.
      // En la PoC redirigimos al sandbox por defecto.
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      mesa: { id: mesa.id, numero: mesa.numero, total: mesa.total },
    };
  } catch (error) {
    throw new ExternalServiceError(
      `No se pudo crear la preferencia de pago: ${error.message}`,
      "MP_PREFERENCE_ERROR",
    );
  }
}

/**
 * Procesa una notificación (webhook) de Mercado Pago.
 *
 * Mercado Pago NO nos manda los datos del pago en el body de la
 * notificación: nos manda solo un ID ("hubo novedades en el pago X") y
 * es responsabilidad nuestra volver a preguntarle a la API "¿y qué pasó
 * con el pago X?". Esto es a propósito: es una medida de seguridad, para
 * que nadie pueda falsificar un webhook mandando un `status: "approved"`
 * apócrifo directo a nuestro endpoint.
 *
 * @param {{type: string, paymentId: string}} notification
 */
async function procesarNotificacionPago({ type, paymentId }) {
  // Mercado Pago manda distintos "type" de eventos (payment, merchant_order,
  // etc). Para esta PoC solo nos interesan los de tipo "payment".
  if (type !== "payment" || !paymentId) {
    logger.info({
      message: `Notificación de MP ignorada (type="${type}", sin datos de pago útiles)`,
      method: "SERVICE",
      path: "procesarNotificacionPago",
    });
    return null;
  }

  const paymentClient = getPaymentClient();

  // 2) Le preguntamos a la API de Mercado Pago los datos REALES de este
  //    pago. Esta consulta usa nuestro Access Token (server-to-server),
  //    por eso es confiable: no depende de nada que haya viajado por el
  //    navegador del cliente.
  let payment;
  try {
    payment = await paymentClient.get({ id: paymentId });
  } catch (error) {
    throw new ExternalServiceError(
      `No se pudo consultar el pago ${paymentId} en Mercado Pago: ${error.message}`,
      "MP_PAYMENT_FETCH_ERROR",
    );
  }

  const {
    status,
    external_reference: mesaId,
    transaction_amount: monto,
  } = payment;

  logger.info({
    message: `Pago ${paymentId} consultado — status: ${status} — mesa: ${mesaId}`,
    method: "SERVICE",
    path: "procesarNotificacionPago",
  });

  // Solo reaccionamos si el pago quedó APROBADO. Si status es "pending",
  // "rejected", "in_process", etc, no hacemos nada especial (MP nos va a
  // volver a notificar si el estado cambia más adelante).
  if (status !== "approved") {
    return { status, mesaId, procesado: false };
  }

  // 3) "Lógica de negocio" simulada: acá, con la DB conectada, harías algo
  //    como `await Mesa.findByIdAndUpdate(mesaId, { pagada: true })` o
  //    `await Comanda.findOneAndUpdate({ mesa: mesaId }, { estado: "pagada" })`.
  //    Por ahora, mutamos el array mock para que la clase vea el efecto.
  const mesa = MESAS_MOCK.find((m) => m.id === mesaId);
  if (mesa) {
    mesa.pagada = true;
  }

  // 4) Acá mandaríamos el mail de "comprobante de pago" al cliente,
  //    reutilizando el mismo email.service.js que ya construimos para
  //    la clase anterior. Queda comentado a propósito: en esta PoC no
  //    tenemos un email real del cliente (no hay formulario de checkout,
  //    es una demo con datos mockeados), pero la integración sería así
  //    de directa gracias a que ya desacoplamos el envío de mail en un
  //    service propio:
  //
  // await sendEmail({
  //   provider: "resend",
  //   to: "cliente@ejemplo.com",
  //   subject: `Pago recibido — Mesa ${mesa?.numero ?? mesaId}`,
  //   template: "order-confirmation",
  //   data: { numero: mesa?.numero, total: monto },
  // });

  // 5) Avisamos al FRONTEND en tiempo real. `getIO()` recupera la misma
  //    instancia de Socket.io que inicializamos en index.js. `io.emit`
  //    (sin especificar una room) manda el evento a TODOS los clientes
  //    conectados; en una app real, para no avisarle a la caja de otro
  //    local, usarías rooms (`io.to("caja-sucursal-1").emit(...)`).
  getIO().emit("payment_success", {
    mesaId,
    numero: mesa?.numero ?? null,
    monto,
    paymentId,
    fecha: new Date().toISOString(),
  });

  return { status, mesaId, procesado: true };
}

export { crearPreferenciaMesa, procesarNotificacionPago, MESAS_MOCK };
