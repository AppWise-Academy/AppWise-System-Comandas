import { io, type Socket } from "socket.io-client";

// ============================================================
// lib/socket.ts
// ------------------------------------------------------------
// Singleton del cliente de Socket.io, mismo patrón que usamos para el
// transporter de Nodemailer del lado del backend: se crea UNA sola vez
// (module scope) y se reutiliza en toda la app, en vez de que cada
// componente abra su propia conexión de WebSocket por separado.
//
// `getSocket()` NO conecta automáticamente al importarse el módulo
// (`autoConnect: false`): quien quiera usarlo decide cuándo conectar
// (`socket.connect()`) y cuándo cortar (`socket.disconnect()`), típicamente
// en un `useEffect`. Así evitamos abrir sockets "fantasma" en páginas que
// ni siquiera necesitan tiempo real.
// ============================================================

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  const url = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

  socket = io(url, {
    autoConnect: false,
    // Igual que en el fetch normal a la API: si tu backend usa cookies
    // de sesión, esto hace que también viajen en el handshake del socket.
    withCredentials: true,
  });

  return socket;
}
