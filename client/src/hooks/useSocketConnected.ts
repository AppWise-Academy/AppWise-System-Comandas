import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

// ============================================================
// hooks/useSocketConnected.ts
// ------------------------------------------------------------
// Hook chiquito para que CUALQUIER componente pueda mostrar el estado real
// de la conexión de Socket.io (🟢/🔴), sin manejar él mismo el ciclo de
// vida de connect()/disconnect(). Ver RootLayout.tsx: es quien realmente
// "posee" la conexión (se abre al entrar a la app, se cierra al salir);
// este hook solo ESCUCHA los eventos "connect"/"disconnect" para reflejar
// el estado actual, tanto acá como en Caja.tsx.
//
// 🎓 Por qué separar "quién conecta" de "quién muestra el estado": si cada
// página que quisiera mostrar el punto de estado también llamara a
// `socket.connect()`/`socket.disconnect()` en su propio useEffect (como
// hacía la versión anterior de Caja.tsx), la página A podría desconectar
// el socket al desmontarse mientras la página B todavía lo estaba usando.
// Con un solo "dueño" de la conexión (el layout, que vive mientras el
// usuario está logueado) evitamos esa pelea.
// ============================================================

export function useSocketConnected(): boolean {
  const socket = getSocket();
  const [conectado, setConectado] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConectado(true);
    const onDisconnect = () => setConectado(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Por si el socket ya se conectó ANTES de que este componente se
    // montara (ej: navegaste de Mesas a Caja con la conexión ya abierta).
    setConectado(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return conectado;
}
