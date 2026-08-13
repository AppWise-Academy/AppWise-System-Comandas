import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { RolGuard } from "../components/RolGuard";
import { Login } from "../pages/Login";
import { Mesas } from "../pages/Mesas";
import { NuevaComanda } from "../pages/NuevaComanda";
import { Cocina } from "../pages/Cocina";
import { Comandas } from "../pages/Comandas";
import { Admin } from "../pages/Admin";
import { Caja } from "../pages/Caja";
import { Success } from "../pages/checkout/Success";
import { Failure } from "../pages/checkout/Failure";
import { Pending } from "../pages/checkout/Pending";

export const router = createBrowserRouter([
  // ── Pública ───────────────────────────────────────────────
  {
    path: "/login",
    element: <Login />,
  },

  // Rutas de las back_urls de Mercado Pago (ver payment.service.js).
  // Quedan afuera del layout/RolGuard a propósito: a estas URLs te trae
  // el navegador DESPUÉS de un pago, no necesariamente con una sesión
  // activa en esta pestaña — no tiene sentido pedir login para verlas.
  { path: "/checkout/success", element: <Success /> },
  { path: "/checkout/failure", element: <Failure /> },
  { path: "/checkout/pending", element: <Pending /> },

  // ── Privada: todo lo que está adentro del layout ──────────
  {
    path: "/",
    element: (
      <RolGuard>
        <RootLayout />
      </RolGuard>
    ),
    children: [
      // Redirige "/" al salón de mesas
      { index: true, element: <Navigate to="/mesas" replace /> },

      {
        path: "mesas",
        element: (
          <RolGuard roles={["mozo", "admin", "cajero"]}>
            <Mesas />
          </RolGuard>
        ),
      },

      {
        path: "comanda/nueva/:mesaId",
        element: (
          <RolGuard roles={["mozo", "admin"]}>
            <NuevaComanda />
          </RolGuard>
        ),
      },

      {
        path: "cocina",
        element: (
          <RolGuard roles={["cocina", "admin"]}>
            <Cocina />
          </RolGuard>
        ),
      },

      {
        path: "comandas",
        element: (
          <RolGuard>
            <Comandas />
          </RolGuard>
        ),
      },

      {
        path: "admin",
        element: (
          <RolGuard roles={["admin"]}>
            <Admin />
          </RolGuard>
        ),
      },

      {
        path: "caja",
        element: (
          <RolGuard roles={["cajero", "admin"]}>
            <Caja />
          </RolGuard>
        ),
      },

      // Fallback: cualquier ruta desconocida vuelve a mesas
      { path: "*", element: <Navigate to="/mesas" replace /> },
    ],
  },
]);
