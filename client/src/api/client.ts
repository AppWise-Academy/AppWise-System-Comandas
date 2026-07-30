import type { ErrorApi, SesionAuth } from "../types";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
export const USAR_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface Handlers {
  obtenerTokens: () => Tokens;
  guardarTokens: (sesion: Partial<SesionAuth>) => void;
  cerrarSesion: () => void;
}

// Los inyecta el store de auth (evita dependencia circular)
const handlers: Handlers = {
  obtenerTokens: () => ({ accessToken: null, refreshToken: null }),
  guardarTokens: () => {},
  cerrarSesion: () => {},
};

let refrescando: Promise<string> | null = null;

async function refrescarToken(): Promise<string> {
  if (refrescando) return refrescando;

  refrescando = (async () => {
    const { refreshToken } = handlers.obtenerTokens();
    if (!refreshToken) throw new Error("Sin refresh token");

    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error("El refresh token no es válido");

    const json = await res.json();
    handlers.guardarTokens(json.data);
    return json.data.accessToken as string;
  })();

  try {
    return await refrescando;
  } finally {
    refrescando = null;
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface OptionsI {
  body?: unknown;
  isFormData?: boolean;
  retry?: boolean;
}

async function peticion<T>(
  method: Method,
  path: string,
  opts: OptionsI = {},
): Promise<T> {
  const { body, isFormData = false, retry = false } = opts;
  const { accessToken } = handlers.obtenerTokens();

  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method: method,
    headers,
    ...(body
      ? { body: isFormData ? (body as FormData) : JSON.stringify(body) }
      : {}),
  });

  const json = await res.json().catch(() => ({}));

  if (res.status === 401 && json.codigo === "TOKEN_EXPIRED" && !retry) {
    try {
      await refrescarToken();
      return peticion<T>(method, path, { ...opts, retry: true });
    } catch {
      handlers.cerrarSesion();
      throw new Error("Tu sesión expiró. Iniciá sesión de nuevo.");
    }
  }

  if (!res.ok) {
    const err = new Error(json.error ?? `Error ${res.status}`) as ErrorApi;
    err.status = res.status;
    err.codigo = json.codigo;
    err.errores = json.errores;
    throw err;
  }

  return json as T;
}

export const http = {
  get: <T>(path: string) => peticion<T>("GET", path),
  post: <T>(path: string, body?: unknown) =>
    peticion<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => peticion<T>("PUT", path, { body }),
  delete: <T>(path: string) => peticion<T>("DELETE", path),
  postForm: <T>(path: string, fd: FormData) =>
    peticion<T>("POST", path, { body: fd, isFormData: true }),
  putForm: <T>(path: string, fd: FormData) =>
    peticion<T>("PUT", path, { body: fd, isFormData: true }),
};
