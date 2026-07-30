import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { Admin } from "../pages/Admin";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Admin />,
  },
]);
