import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import * as api from "../api";
import type {
  Mesa,
  Comanda,
  Producto,
  CategoriaConProductos,
  Notificacion,
  Usuario,
  StatsComandas,
  StatsMesas,
  ComandaInput,
  EstadoComanda,
  EstadoItem,
  MetodoPago,
  Rol,
} from "../types";

// ── Query keys centralizados ─────────────────────────────────
// Los tenemos acá para que las invalidaciones sean consistentes.
// Si el alumno cambia un key, lo hace en un solo lugar.
export const QK = {
  mesas: ["mesas"] as const,
  mesa: (id: string) => ["mesas", id] as const,
  statsMesas: ["mesas", "stats"] as const,
  carta: ["menu", "carta"] as const,
  productos: ["menu", "productos"] as const,
  masVendidos: ["menu", "mas-vendidos"] as const,
  comandas: (activas?: boolean) => ["comandas", { activas }] as const,
  comanda: (id: string) => ["comandas", id] as const,
  statsComandas: ["comandas", "stats"] as const,
  notificaciones: ["notificaciones"] as const,
  usuarios: ["usuarios"] as const,
};

// ── Mesas ─────────────────────────────────────────────────────
export function useMesas(): UseQueryResult<Mesa[]> {
  return useQuery({ queryKey: QK.mesas, queryFn: api.getMesas });
}

export function useMesa(id: string): UseQueryResult<Mesa> {
  return useQuery({ queryKey: QK.mesa(id), queryFn: () => api.getMesa(id) });
}

export function useStatsMesas(): UseQueryResult<StatsMesas> {
  return useQuery({ queryKey: QK.statsMesas, queryFn: api.getStatsMesas });
}

export function useAbrirMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comensales }: { id: string; comensales: number }) =>
      api.abrirMesa(id, comensales),
    // Actualizar la caché sin recargar la lista entera
    onSuccess: (mesa) => {
      qc.setQueryData<Mesa[]>(QK.mesas, (prev) =>
        prev?.map((m) => (m.id === mesa.id ? mesa : m)),
      );
    },
  });
}

export function usePedirCuenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.pedirCuenta(id),
    onSuccess: (mesa) => {
      qc.setQueryData<Mesa[]>(QK.mesas, (prev) =>
        prev?.map((m) => (m.id === mesa.id ? mesa : m)),
      );
    },
  });
}

export function useLiberarMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.liberarMesa(id),
    onSuccess: (mesa) => {
      qc.setQueryData<Mesa[]>(QK.mesas, (prev) =>
        prev?.map((m) => (m.id === mesa.id ? mesa : m)),
      );
    },
  });
}

// ── Menú ──────────────────────────────────────────────────────
export function useCarta(): UseQueryResult<CategoriaConProductos[]> {
  return useQuery({ queryKey: QK.carta, queryFn: api.getCarta });
}

export function useProductos(): UseQueryResult<Producto[]> {
  return useQuery({ queryKey: QK.productos, queryFn: api.getProductos });
}

export function useMasVendidos(): UseQueryResult<Producto[]> {
  return useQuery({ queryKey: QK.masVendidos, queryFn: api.getMasVendidos });
}

export function useToggleDisponible() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.toggleDisponible(id),
    onSuccess: () => {
      // Invalidar carta y lista de productos para que se recarguen
      void qc.invalidateQueries({ queryKey: QK.carta });
      void qc.invalidateQueries({ queryKey: QK.productos });
    },
  });
}

// ── Comandas ──────────────────────────────────────────────────
export function useComandas(soloActivas = false): UseQueryResult<Comanda[]> {
  return useQuery({
    queryKey: QK.comandas(soloActivas),
    queryFn: () => api.getComandas(soloActivas),
    // Refrescar cada 30s para que la lista esté actualizada
    // (cuando conecten el WS real, pueden quitarlo)
    refetchInterval: 30_000,
  });
}

export function useComanda(id: string): UseQueryResult<Comanda> {
  return useQuery({
    queryKey: QK.comanda(id),
    queryFn: () => api.getComanda(id),
  });
}

export function useStatsComandas(): UseQueryResult<StatsComandas> {
  return useQuery({
    queryKey: QK.statsComandas,
    queryFn: api.getStatsComandas,
  });
}

export function useCrearComanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ComandaInput) => api.crearComanda(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["comandas"] });
    },
  });
}

export function useCambiarEstadoComanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoComanda }) =>
      api.cambiarEstadoComanda(id, estado),
    // Actualizar en caché optimistamente antes de que llegue el WS
    onSuccess: (comanda) => {
      qc.setQueryData<Comanda[]>(QK.comandas(false), (prev) =>
        prev?.map((c) => (c.id === comanda.id ? comanda : c)),
      );
      qc.setQueryData<Comanda[]>(QK.comandas(true), (prev) =>
        prev?.map((c) => (c.id === comanda.id ? comanda : c)),
      );
    },
  });
}

export function useCambiarEstadoItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      comandaId,
      itemId,
      estado,
    }: {
      comandaId: string;
      itemId: string;
      estado: EstadoItem;
    }) => api.cambiarEstadoItem(comandaId, itemId, estado),
    onSuccess: (comanda) => {
      qc.setQueryData<Comanda[]>(QK.comandas(true), (prev) =>
        prev?.map((c) => (c.id === comanda.id ? comanda : c)),
      );
    },
  });
}

export function useCobrar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, metodoPago }: { id: string; metodoPago: MetodoPago }) =>
      api.cobrar(id, metodoPago),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["comandas"] });
      void qc.invalidateQueries({ queryKey: QK.mesas });
    },
  });
}

// ── Notificaciones ────────────────────────────────────────────
export function useNotificaciones(): UseQueryResult<Notificacion[]> {
  return useQuery({
    queryKey: QK.notificaciones,
    queryFn: api.getNotificaciones,
    refetchInterval: 15_000,
  });
}

export function useMarcarLeidas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.marcarNotificacionesLeidas,
    onSuccess: () => void qc.invalidateQueries({ queryKey: QK.notificaciones }),
  });
}

// ── Usuarios ──────────────────────────────────────────────────
export function useUsuarios(): UseQueryResult<Usuario[]> {
  return useQuery({ queryKey: QK.usuarios, queryFn: api.getUsuarios });
}

export function useCambiarRol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rol }: { id: string; rol: Rol }) =>
      api.cambiarRol(id, rol),
    onSuccess: () => void qc.invalidateQueries({ queryKey: QK.usuarios }),
  });
}

export function useToggleActivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.toggleActivo(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: QK.usuarios }),
  });
}
