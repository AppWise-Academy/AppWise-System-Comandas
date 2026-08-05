// ============================================================
// types/index.ts — Todo el dominio en un lugar.
// Los alumnos van a ir rellenando la API real y estos tipos
// guían qué tiene que devolver cada endpoint.
// ============================================================

export type Rol = "admin" | "mozo" | "cocina" | "cajero";
export type Sector = "salon" | "terraza" | "barra" | "vip";
export type MetodoPago = "efectivo" | "tarjeta" | "transferencia";

export type EstadoMesa = "libre" | "ocupada" | "reservada" | "cuenta";

export type EstadoComanda =
  | "pendiente"
  | "en_preparacion"
  | "lista"
  | "entregada"
  | "pagada"
  | "cancelada";

export type EstadoItem =
  | "pendiente"
  | "en_preparacion"
  | "listo"
  | "entregado"
  | "cancelado";

// ── Entidades ────────────────────────────────────────────────

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  avatar: string | null;
}

export interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  sector: Sector;
  estado: EstadoMesa;
  mozo: Pick<Usuario, "id" | "nombre"> | null;
  comensales: number;
  abiertaEn: string | null;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  orden: number;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: Categoria;
  tiempoPreparacion: number;
  disponible: boolean;
  vecesVendido: number;
  imagen: string | null;
}

export interface CategoriaConProductos extends Categoria {
  productos: Producto[];
}

export interface ItemComanda {
  _id: string;
  producto: string;
  nombre: string;   // snapshot — no cambia si el producto cambia de nombre
  precio: number;   // snapshot — el precio que pagó el cliente
  cantidad: number;
  notas: string;
  estado: EstadoItem;
}

export interface Comanda {
  id: string;
  numero: number;
  mesa: Pick<Mesa, "id" | "numero" | "sector">;
  mozo: Pick<Usuario, "id" | "nombre">;
  items: ItemComanda[];
  estado: EstadoComanda;
  total: number;
  observaciones: string;
  enviadaEn: string;
  listaEn: string | null;
  entregadaEn: string | null;
  pagadaEn: string | null;
  metodoPago: MetodoPago | null;
  createdAt: string;
}

export interface Notificacion {
  id: string;
  tipo: "comanda_lista" | "comanda_nueva" | "mesa_cuenta" | "sistema";
  mensaje: string;
  leida: boolean;
  mesa: number | null;
  createdAt: string;
}

export interface StatsComandas {
  comandasHoy: number;
  ventasHoy: number;
  ticketPromedio: number;
  tiempoPromedioPreparacion: number;
  comandasPagadas: number;
  porEstado: Partial<Record<EstadoComanda, number>>;
}

export interface StatsMesas {
  total: number;
  libres: number;
  ocupadas: number;
  cuenta: number;
  ocupacion: number;
}

// ── Inputs ───────────────────────────────────────────────────

export interface ItemInput {
  productoId: string;
  cantidad: number;
  notas?: string;
}

export interface ComandaInput {
  mesaId: string;
  items: ItemInput[];
  observaciones?: string;
}
