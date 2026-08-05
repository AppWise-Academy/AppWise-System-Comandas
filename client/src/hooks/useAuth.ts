import { useState, useCallback } from "react";
import { USUARIOS } from "../mocks/datos";
import type { Usuario, Rol } from "../types";

const STORAGE_KEY = "comandas_user";

function cargarDelStorage(): Usuario | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

// Hook global (en una app real, usarías Context o Zustand)
let _usuario: Usuario | null = cargarDelStorage();
const _listeners: Array<() => void> = [];

function notificar() {
  _listeners.forEach((fn) => fn());
}

export function useAuth() {
  const [usuario, setUsuarioLocal] = useState<Usuario | null>(_usuario);

  const login = useCallback((email: string, password: string): boolean => {
    const encontrado = USUARIOS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    );
    if (!encontrado) return false;

    const { password: _p, ...u } = encontrado;
    _usuario = u;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUsuarioLocal(u);
    notificar();
    return true;
  }, []);

  const logout = useCallback(() => {
    _usuario = null;
    localStorage.removeItem(STORAGE_KEY);
    setUsuarioLocal(null);
    notificar();
  }, []);

  return { usuario, login, logout };
}

// Selector de solo el rol (para los guards de rutas)
export function useRol(): Rol | undefined {
  const { usuario } = useAuth();
  return usuario?.rol;
}
