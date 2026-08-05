import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Alert } from "../components/ui/Feedback";
import { Btn } from "../components/ui/Btn";
import type { Rol } from "../types";

const DEMO: { rol: Rol; email: string; pass: string; icon: string }[] = [
  { rol: "admin",  email: "admin@resto.com",  pass: "Admin123", icon: "👔" },
  { rol: "mozo",   email: "mozo@resto.com",   pass: "Mozo1234", icon: "🧑‍🍳" },
  { rol: "cocina", email: "cocina@resto.com", pass: "Cocina12", icon: "👨‍🍳" },
  { rol: "cajero", email: "caja@resto.com",   pass: "Caja1234", icon: "💵" },
];

const DESC: Record<Rol, string> = {
  admin: "ve todo el sistema", mozo: "toma pedidos", cocina: "prepara los platos", cajero: "cobra",
};

export function Login() {
  const [email, setEmail] = useState("mozo@resto.com");
  const [password, setPassword] = useState("Mozo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const IN = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 250)); // simula la llamada al backend
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      navigate("/mesas");
    } else {
      setError("Email o contraseña incorrectos.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-lg"
      >
        <div className="mb-6 text-center">
          <div className="text-5xl">🍽️</div>
          <h1 className="mt-2 text-2xl font-extrabold">Sistema de Comandas</h1>
          <p className="mt-1 text-sm text-slate-500">Ingresá con tu usuario del restaurante</p>
        </div>

        {error && <Alert tipo="error">{error}</Alert>}

        <label className="mb-4 block text-sm font-medium">
          Email
          <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} className={IN} />
        </label>

        <label className="mb-5 block text-sm font-medium">
          Contraseña
          <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} className={IN} />
        </label>

        <Btn type="submit" disabled={loading} s="lg" className="w-full">
          {loading ? "Ingresando..." : "Ingresar"}
        </Btn>

        {/* Chips de demo */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2.5 text-xs text-slate-400">Usuarios de prueba (tocá para completar):</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO.map((d) => (
              <button
                key={d.rol}
                type="button"
                onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                className="rounded-lg border border-slate-200 p-2.5 text-left text-xs transition-colors hover:border-orange-400 hover:bg-orange-50"
              >
                <span className="mr-1">{d.icon}</span>
                <strong className="capitalize">{d.rol}</strong>
                <span className="mt-0.5 block text-[10px] text-slate-400">{DESC[d.rol]}</span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
