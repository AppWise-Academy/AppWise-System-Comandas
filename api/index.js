import "dotenv/config";
import http from "node:http";
import app from "./src/app.js";
import { SETTINGS_ENV } from "./src/settings/index.js";
import { dbConnect } from "./src/config/db.js";
import { initSocket } from "./src/config/socket.config.js";

const { port } = SETTINGS_ENV.app;

// Un WebSocket es un "upgrade" de una conexión HTTP normal, no un
// servidor aparte con su propio puerto. Por eso, para que Socket.io
// pueda convivir con Express en el mismo puerto, envolvemos la app de
// Express en un servidor HTTP "crudo" de Node ANTES de escuchar: Express
// sigue manejando las rutas normales (/api/...), y ese mismo server es al
// que Socket.io engancha su propio protocolo por debajo.
const server = http.createServer(app);

// Inicializamos Socket.io UNA sola vez acá, al arrancar el proceso. De acá
// en más, cualquier service (ej: payment.service.js) puede emitir eventos
// llamando a getIO() sin necesitar esta instancia como parámetro.
initSocket(server);

server.listen(port, () => {
  console.log(`Server on port ${port} running`);
  dbConnect();
});
