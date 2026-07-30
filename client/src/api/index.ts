import { type SesionAuth, type RespuestaApi } from "../types";
import { http } from "./client";

export const api = {
  async login(email: string, password: string) {
    const res = await http.post<RespuestaApi<SesionAuth>>("/api/auth/login", {
      email,
      password,
    });

    return res.data;
  },
};
