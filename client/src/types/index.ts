export type Rol = "admin" | "mozo" | "cocina" | "cajero";

export interface UserInterface {
  id: string;
  name: string;
  email: string;
  rol: Rol;
  isActive: boolean;
  avatar: string | null;
}

export interface ErrorValidacion {
  campo: string;
  mensaje: string;
}

export interface MetaPaginacion {
  total: number;
  page: number;
  limit: number;
  paginas: number;
  haySiguiente: boolean;
}

export interface RespuestaApi<T> {
  ok: true;
  data: T;
  meta?: MetaPaginacion;
  noLeidas?: number;
}

/** Error que lanza el cliente HTTP (Error + datos que manda la API) */
export interface ErrorApi extends Error {
  status?: number;
  codigo?: string;
  errores?: ErrorValidacion[];
}

export interface SesionAuth {
  usuario: UserInterface;
  accessToken: string;
  refreshToken: string;
}

export type EstadoComanda =
  | "pendiente"
  | "en_preparacion"
  | "lista"
  | "entregada"
  | "pagada"
  | "cancelada";

export type EstadoMesa = "libre" | "ocupada" | "reservada" | "cuenta";

export interface StatsComandas {
  comandasHoy: number;
  porEstado: Partial<Record<EstadoComanda, number>>;
  ventasHoy: number;
  comandasPagadas: number;
  ticketPromedio: number;
  tiempoPromedioPreparacion: number;
}

export interface StatsMesas {
  total: number;
  libres: number;
  ocupadas: number;
  cuenta: number;
  ocupacion: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  orden: number;
  activa: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: Categoria | string;
  tiempoPreparacion: number;
  disponible: boolean;
  vecesVendido: number;
  imagen: string | null;
}
