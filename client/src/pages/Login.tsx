import React, { useState } from "react";
import { Boton } from "../components/ui/Boton";
import { useAuthStore } from "../store/authStore";
import { Alert } from "../components/ui/Alert";

const DEMO = [
  {
    rol: "admin",
    email: "admin@resto.com",
    pass: "Admin123",
    desc: "ve todo",
    icono: "👔",
  },
  {
    rol: "mozo",
    email: "mozo@resto.com",
    pass: "Mozo1234",
    desc: "toma pedidos",
    icono: "🧑‍🍳",
  },
  {
    rol: "cocina",
    email: "cocina@resto.com",
    pass: "Cocina12",
    desc: "prepara",
    icono: "👨‍🍳",
  },
  {
    rol: "cajero",
    email: "caja@resto.com",
    pass: "Caja1234",
    desc: "cobra",
    icono: "💵",
  },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loading, login, error, clearError } = useAuthStore();

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  const inputClase =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm " +
    "focus:border-marca-500 focus:outline-none focus:ring-2 focus:ring-marca-200";

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4">
      <form
        onSubmit={send}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-lg"
      >
        <div className="mb-6 text-center">
          <div className="text-4xl">🍽️</div>
          <h1 className="mt-2 text-xl font-extrabold">Sistema de Comandas</h1>
          <p className="text-sm text-slate-500">
            Ingresá con tu usuario del restaurante
          </p>
        </div>

        {error && <Alert>{error}</Alert>}

        <label className="mb-4 block text-sm font-medium">
          Email
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className={inputClase}
          />
        </label>

        <label className="mb-5 block text-sm font-medium">
          Contraseña
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className={inputClase}
          />
        </label>

        <Boton type="submit" disabled={loading} tamano="lg" className="w-full">
          {loading ? "Ingresando..." : "Ingresar"}
        </Boton>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs text-slate-500">
            Usuarios de prueba (tocá para completar):
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO.map((d) => (
              <button
                key={d.rol}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.pass);
                }}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-left text-xs transition-colors hover:border-marca-400 hover:bg-marca-50"
              >
                <span className="mr-1">{d.icono}</span>
                <strong>{d.rol}</strong>
                <span className="block text-[10px] text-slate-400">
                  {d.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
