import { Server } from "socket.io";

// ============================================================
// config/socket.config.js
// ------------------------------------------------------------
// Setup de Socket.IO como singleton de módulo (mismo patrón que usamos
// para el transporter de Nodemailer o el cliente de Mercado Pago): se
// inicializa UNA vez, enganchado al servidor HTTP de Express, y desde
// cualquier controller/service del resto de la app lo recuperamos con
// `getIO()` sin tener que pasarlo como parámetro por todos lados.
//
// ¿Por qué Socket.IO necesita el servidor HTTP "crudo" y no la app de
// Express? Porque un WebSocket es un upgrade de la conexión HTTP inicial
// (mismo puerto, mismo handshake), no un servidor aparte. Por eso en
// index.js vas a ver que envolvemos `app` con `http.createServer(app)`
// ANTES de escuchar el puerto, y a ESE server (no a `app`) es al que
// engancha Socket.IO.
// ============================================================

let io = null;

/**
 * Crea la instancia de Socket.IO enganchada al servidor HTTP y la deja
 * guardada en el módulo. Se llama una única vez, desde index.js.
 *
 * @param {import('http').Server} httpServer
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      // Mismo origen permitido que usamos para las requests HTTP normales
      // (ver middlewares/cors.js). Sin esto, el navegador bloquea el
      // handshake del WebSocket por CORS igual que bloquearía un fetch.
      origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [],
      credentials: true,
    },
  });

  // Log didáctico: cada vez que el front (Caja.tsx) abre la conexión de
  // WebSocket, vemos su "socket.id" acá. Sirve para confirmar en clase
  // que el front SÍ está conectado antes de probar un pago.
  io.on("connection", (socket) => {
    console.log(`🔌 Cliente conectado por WebSocket: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Devuelve la instancia ya inicializada. La usan los services (ej:
 * payment.service.js) para emitir eventos hacia el front sin acoplarse
 * a Express (un service no debería depender de `req`/`res`).
 */
export function getIO() {
  if (!io) {
    throw new Error(
      "Socket.io todavía no fue inicializado. Llamá a initSocket(server) en index.js antes de usar getIO().",
    );
  }
  return io;
}
