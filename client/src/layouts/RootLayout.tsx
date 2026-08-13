import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSocketConnected } from "../hooks/useSocketConnected";
import { getSocket } from "../lib/socket";
import { Notificaciones } from "../components/Notificaciones";
import { BadgeRol } from "../components/ui/Badge";
import type { Rol } from "../types";

// Qué ve cada rol en el menú
const LINKS: Record<Rol, { to: string; label: string }[]> = {
  admin: [
    { to: "/mesas", label: "Salón" },
    { to: "/comandas", label: "Comandas" },
    { to: "/cocina", label: "Cocina" },
    { to: "/caja", label: "Caja" },
    { to: "/admin", label: "Panel" },
  ],
  mozo: [
    { to: "/mesas", label: "Salón" },
    { to: "/comandas", label: "Comandas" },
  ],
  cocina: [
    { to: "/cocina", label: "Cocina" },
    { to: "/comandas", label: "Comandas" },
  ],
  cajero: [
    { to: "/comandas", label: "Comandas" },
    { to: "/mesas", label: "Salón" },
    { to: "/caja", label: "Caja" },
  ],
};

export function RootLayout() {
  const { usuario, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const conectado = useSocketConnected();

  // El layout es el "dueño" de la conexión de Socket.io: se abre acá,
  // apenas hay un usuario logueado (RootLayout solo se monta adentro del
  // RolGuard), y se cierra si el usuario sale de la app. Cualquier página
  // hija (ej: Caja.tsx) solo escucha eventos puntuales (payment_success),
  // sin volver a conectar/desconectar el socket por su cuenta.
  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  const salir = () => {
    logout();
    navigate("/login");
  };
  const links = usuario ? LINKS[usuario.rol] : [];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          {/* Logo + links de la izquierda */}
          <div className="flex items-center gap-0.5">
            <span className="mr-4 font-extrabold text-lg select-none">
              🍽️ Comandas
            </span>
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === to
                    ? "bg-orange-100 text-orange-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Derecha: conexión + campana + usuario */}
          <div className="flex items-center gap-3">
            {/* Indicador real de Socket.io — refleja el estado del socket
                que abre este mismo layout (ver useEffect arriba). */}
            <span
              className="text-xs text-slate-400"
              title={conectado ? "WebSocket conectado" : "WebSocket desconectado"}
            >
              {conectado ? "🟢" : "🔴"}
            </span>

            <Notificaciones />

            <span className="flex items-center gap-1.5 text-sm font-medium">
              {usuario?.nombre}
              {usuario && <BadgeRol rol={usuario.rol} />}
            </span>

            <button
              onClick={salir}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido de la página actual */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
