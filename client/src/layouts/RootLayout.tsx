import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Notificaciones } from "../components/Notificaciones";
import { BadgeRol } from "../components/ui/Badge";
import type { Rol } from "../types";

// Qué ve cada rol en el menú
const LINKS: Record<Rol, { to: string; label: string }[]> = {
  admin: [
    { to: "/mesas", label: "Salón" },
    { to: "/comandas", label: "Comandas" },
    { to: "/cocina", label: "Cocina" },
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
  ],
};

export function RootLayout() {
  const { usuario, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
            {/* Indicador WebSocket — los alumnos lo conectan en semana 6 */}
            <span
              className="text-xs text-slate-400"
              title="WebSocket desconectado — se conecta con el backend real"
            >
              🔴
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
