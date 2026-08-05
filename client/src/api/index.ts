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

import * as mock from "../mocks/datos";

// Simula la latencia de red para que los estados de loading/error
// tengan sentido cuando los alumnos los vean por primera vez.
const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

// ── Mesas ─────────────────────────────────────────────────────
export async function getMesas(): Promise<Mesa[]> {
  await delay(200);
  return structuredClone(mock.mesas);
}

export async function getMesa(id: string): Promise<Mesa> {
  await delay(150);
  const m = mock.mesas.find((x) => x.id === id);
  if (!m) throw new Error(`Mesa ${id} no encontrada`);
  return structuredClone(m);
}

export async function getStatsMesas(): Promise<StatsMesas> {
  await delay(150);
  return structuredClone(mock.statsMesas);
}

export async function abrirMesa(id: string, comensales: number): Promise<Mesa> {
  await delay(250);
  const m = mock.mesas.find((x) => x.id === id);
  if (!m) throw new Error("Mesa no encontrada");
  m.estado = "ocupada";
  m.comensales = comensales;
  m.abiertaEn = new Date().toISOString();
  return structuredClone(m);
}

export async function pedirCuenta(id: string): Promise<Mesa> {
  await delay(200);
  const m = mock.mesas.find((x) => x.id === id);
  if (!m) throw new Error("Mesa no encontrada");
  m.estado = "cuenta";
  return structuredClone(m);
}

export async function liberarMesa(id: string): Promise<Mesa> {
  await delay(250);
  const m = mock.mesas.find((x) => x.id === id);
  if (!m) throw new Error("Mesa no encontrada");
  m.estado = "libre";
  m.mozo = null;
  m.comensales = 0;
  m.abiertaEn = null;
  return structuredClone(m);
}

// ── Menú ──────────────────────────────────────────────────────
export async function getCarta(): Promise<CategoriaConProductos[]> {
  await delay(250);
  return structuredClone(mock.carta);
}

export async function getProductos(): Promise<Producto[]> {
  await delay(200);
  return structuredClone(mock.productos);
}

export async function getMasVendidos(): Promise<Producto[]> {
  await delay(200);
  return structuredClone(mock.productos)
    .sort((a, b) => b.vecesVendido - a.vecesVendido)
    .slice(0, 8);
}

export async function toggleDisponible(id: string): Promise<Producto> {
  await delay(200);
  const p = mock.productos.find((x) => x.id === id);
  if (!p) throw new Error("Producto no encontrado");
  p.disponible = !p.disponible;
  // Sincronizar carta
  for (const cat of mock.carta) {
    if (p.disponible) {
      if (
        !cat.productos.find((x) => x.id === id) &&
        cat.id === p.categoria.id
      ) {
        cat.productos.push(p);
      }
    } else {
      cat.productos = cat.productos.filter((x) => x.id !== id);
    }
  }
  return structuredClone(p);
}

// ── Comandas ──────────────────────────────────────────────────
export async function getComandas(soloActivas = false): Promise<Comanda[]> {
  await delay(250);
  const activas: EstadoComanda[] = ["pendiente", "en_preparacion", "lista"];
  const lista = soloActivas
    ? mock.comandas.filter((c) => activas.includes(c.estado))
    : mock.comandas;
  return structuredClone(
    [...lista].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );
}

export async function getComanda(id: string): Promise<Comanda> {
  await delay(150);
  const c = mock.comandas.find((x) => x.id === id);
  if (!c) throw new Error("Comanda no encontrada");
  return structuredClone(c);
}

export async function getStatsComandas(): Promise<StatsComandas> {
  await delay(200);
  return structuredClone(mock.statsComandas);
}

const TRANSICIONES: Record<EstadoComanda, EstadoComanda[]> = {
  pendiente: ["en_preparacion", "cancelada"],
  en_preparacion: ["lista", "cancelada"],
  lista: ["entregada", "cancelada"],
  entregada: ["pagada"],
  pagada: [],
  cancelada: [],
};

export async function crearComanda(input: ComandaInput): Promise<Comanda> {
  await delay(350);

  const mesa = mock.mesas.find((m) => m.id === input.mesaId);
  if (!mesa) throw new Error("Mesa no encontrada");

  const items = input.items.map((it, i) => {
    const prod = mock.productos.find((p) => p.id === it.productoId);
    if (!prod) throw new Error(`Producto ${it.productoId} no encontrado`);
    return {
      _id: `i${Date.now()}${i}`,
      producto: prod.id,
      nombre: prod.nombre, // snapshot
      precio: prod.precio, // snapshot
      cantidad: it.cantidad,
      notas: it.notas ?? "",
      estado: "pendiente" as EstadoItem,
    };
  });

  const comanda: Comanda = {
    id: `cm${Date.now()}`,
    numero: mock.comandas.length + 1,
    mesa: { id: mesa.id, numero: mesa.numero, sector: mesa.sector },
    mozo: { id: "u2", nombre: "Marcos Mozo" }, // TODO: vendría del token JWT
    items,
    estado: "pendiente",
    total: items.reduce((s, i) => s + i.precio * i.cantidad, 0),
    observaciones: input.observaciones ?? "",
    enviadaEn: new Date().toISOString(),
    listaEn: null,
    entregadaEn: null,
    pagadaEn: null,
    metodoPago: null,
    createdAt: new Date().toISOString(),
  };

  mock.comandas.unshift(comanda);
  return structuredClone(comanda);
}

export async function cambiarEstadoComanda(
  id: string,
  nuevoEstado: EstadoComanda,
): Promise<Comanda> {
  await delay(250);
  const comanda = mock.comandas.find((c) => c.id === id);
  if (!comanda) throw new Error("Comanda no encontrada");

  const permitidos = TRANSICIONES[comanda.estado];
  if (!permitidos.includes(nuevoEstado)) {
    throw new Error(
      `No se puede pasar de "${comanda.estado}" a "${nuevoEstado}". ` +
        `Transiciones válidas: ${permitidos.join(", ") || "ninguna"}`,
    );
  }

  comanda.estado = nuevoEstado;
  if (nuevoEstado === "lista") comanda.listaEn = new Date().toISOString();
  if (nuevoEstado === "entregada")
    comanda.entregadaEn = new Date().toISOString();
  if (nuevoEstado === "pagada") comanda.pagadaEn = new Date().toISOString();

  return structuredClone(comanda);
}

export async function cambiarEstadoItem(
  comandaId: string,
  itemId: string,
  nuevoEstado: EstadoItem,
): Promise<Comanda> {
  await delay(200);
  const comanda = mock.comandas.find((c) => c.id === comandaId);
  if (!comanda) throw new Error("Comanda no encontrada");
  const item = comanda.items.find((i) => i._id === itemId);
  if (!item) throw new Error("Item no encontrado");
  item.estado = nuevoEstado;

  // Auto-transición: si todos los items activos están listos → comanda lista
  const activos = comanda.items.filter((i) => i.estado !== "cancelado");
  if (
    activos.length > 0 &&
    activos.every((i) => i.estado === "listo") &&
    comanda.estado === "en_preparacion"
  ) {
    comanda.estado = "lista";
    comanda.listaEn = new Date().toISOString();
  }

  return structuredClone(comanda);
}

export async function cobrar(
  id: string,
  metodoPago: MetodoPago,
): Promise<Comanda> {
  await delay(300);
  const comanda = mock.comandas.find((c) => c.id === id);
  if (!comanda) throw new Error("Comanda no encontrada");
  comanda.estado = "pagada";
  comanda.pagadaEn = new Date().toISOString();
  comanda.metodoPago = metodoPago;
  return structuredClone(comanda);
}

// ── Notificaciones ────────────────────────────────────────────
export async function getNotificaciones(): Promise<Notificacion[]> {
  await delay(150);
  return structuredClone(mock.notificaciones);
}

export async function marcarNotificacionesLeidas(): Promise<void> {
  await delay(100);
  mock.notificaciones.forEach((n) => {
    n.leida = true;
  });
}

// ── Usuarios ──────────────────────────────────────────────────
export async function getUsuarios(): Promise<Usuario[]> {
  await delay(200);
  return structuredClone(mock.usuarios);
}

export async function cambiarRol(id: string, rol: Rol): Promise<Usuario> {
  await delay(200);
  const u = mock.usuarios.find((x) => x.id === id);
  if (!u) throw new Error("Usuario no encontrado");
  u.rol = rol;
  return structuredClone(u);
}

export async function toggleActivo(id: string): Promise<Usuario> {
  await delay(200);
  const u = mock.usuarios.find((x) => x.id === id);
  if (!u) throw new Error("Usuario no encontrado");
  u.activo = !u.activo;
  return structuredClone(u);
}
