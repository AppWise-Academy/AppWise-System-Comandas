// ============================================================
// mocks/datos.ts — Datos falsos para la UI
// Son los mismos que crea `npm run seed` en el backend.
// Cuando el alumno conecte la API real, estos datos quedan
// reemplazados automáticamente por los de TanStack Query.
// ============================================================

import type {
  Usuario,
  Mesa,
  Categoria,
  Producto,
  CategoriaConProductos,
  Comanda,
  Notificacion,
  StatsComandas,
  StatsMesas,
} from "../types";

const hace = (min: number) =>
  new Date(Date.now() - min * 60_000).toISOString();

// ── Usuarios ─────────────────────────────────────────────────
export const USUARIOS: (Usuario & { password: string })[] = [
  { id: "u1", nombre: "Ana Gerente",    email: "admin@resto.com",  rol: "admin",  activo: true, avatar: null, password: "Admin123" },
  { id: "u2", nombre: "Marcos Mozo",    email: "mozo@resto.com",   rol: "mozo",   activo: true, avatar: null, password: "Mozo1234" },
  { id: "u3", nombre: "Lucía Mozo",     email: "mozo2@resto.com",  rol: "mozo",   activo: true, avatar: null, password: "Mozo1234" },
  { id: "u4", nombre: "Carlos Chef",    email: "cocina@resto.com", rol: "cocina", activo: true, avatar: null, password: "Cocina12" },
  { id: "u5", nombre: "Sofía Cajera",   email: "caja@resto.com",   rol: "cajero", activo: true, avatar: null, password: "Caja1234" },
];

export const usuarios: Usuario[] = USUARIOS.map(({ password: _p, ...u }) => u);

// ── Mesas ────────────────────────────────────────────────────
export const mesas: Mesa[] = [
  { id: "m1",  numero: 1,  capacidad: 2, sector: "salon",   estado: "libre",   mozo: null,                           comensales: 0, abiertaEn: null },
  { id: "m2",  numero: 2,  capacidad: 2, sector: "salon",   estado: "libre",   mozo: null,                           comensales: 0, abiertaEn: null },
  { id: "m3",  numero: 3,  capacidad: 2, sector: "salon",   estado: "ocupada", mozo: { id: "u2", nombre: "Marcos" }, comensales: 2, abiertaEn: hace(25) },
  { id: "m4",  numero: 4,  capacidad: 2, sector: "salon",   estado: "libre",   mozo: null,                           comensales: 0, abiertaEn: null },
  { id: "m5",  numero: 5,  capacidad: 4, sector: "salon",   estado: "ocupada", mozo: { id: "u3", nombre: "Lucía" },  comensales: 4, abiertaEn: hace(12) },
  { id: "m6",  numero: 6,  capacidad: 4, sector: "salon",   estado: "libre",   mozo: null,                           comensales: 0, abiertaEn: null },
  { id: "m7",  numero: 7,  capacidad: 4, sector: "salon",   estado: "cuenta",  mozo: { id: "u2", nombre: "Marcos" }, comensales: 3, abiertaEn: hace(68) },
  { id: "m8",  numero: 8,  capacidad: 4, sector: "salon",   estado: "libre",   mozo: null,                           comensales: 0, abiertaEn: null },
  { id: "m9",  numero: 9,  capacidad: 6, sector: "terraza", estado: "ocupada", mozo: { id: "u2", nombre: "Marcos" }, comensales: 5, abiertaEn: hace(8) },
  { id: "m10", numero: 10, capacidad: 6, sector: "terraza", estado: "libre",   mozo: null,                           comensales: 0, abiertaEn: null },
  { id: "m11", numero: 11, capacidad: 2, sector: "barra",   estado: "libre",   mozo: null,                           comensales: 0, abiertaEn: null },
  { id: "m12", numero: 12, capacidad: 8, sector: "vip",     estado: "reservada", mozo: null,                         comensales: 0, abiertaEn: null },
];

// ── Carta ────────────────────────────────────────────────────
const CAT: Categoria[] = [
  { id: "c1", nombre: "Entradas",    icono: "🥗", orden: 1 },
  { id: "c2", nombre: "Principales", icono: "🍖", orden: 2 },
  { id: "c3", nombre: "Pastas",      icono: "🍝", orden: 3 },
  { id: "c4", nombre: "Postres",     icono: "🍰", orden: 4 },
  { id: "c5", nombre: "Bebidas",     icono: "🥤", orden: 5 },
];

const cat = (id: string) => CAT.find((c) => c.id === id)!;

export const productos: Producto[] = [
  { id: "p1",  nombre: "Empanadas de carne (x3)", descripcion: "Fritas o al horno",            precio: 4_200,  categoria: cat("c1"), tiempoPreparacion: 12, disponible: true,  vecesVendido: 48, imagen: null },
  { id: "p2",  nombre: "Provoleta",               descripcion: "Con orégano y aceite de oliva", precio: 5_500,  categoria: cat("c1"), tiempoPreparacion: 10, disponible: true,  vecesVendido: 31, imagen: null },
  { id: "p3",  nombre: "Rabas",                   descripcion: "Con alioli casero",             precio: 8_900,  categoria: cat("c1"), tiempoPreparacion: 15, disponible: false, vecesVendido: 22, imagen: null },
  { id: "p4",  nombre: "Bife de chorizo",         descripcion: "400g con guarnición",           precio: 14_500, categoria: cat("c2"), tiempoPreparacion: 25, disponible: true,  vecesVendido: 67, imagen: null },
  { id: "p5",  nombre: "Milanesa napolitana",     descripcion: "Con papas fritas",              precio: 11_800, categoria: cat("c2"), tiempoPreparacion: 20, disponible: true,  vecesVendido: 54, imagen: null },
  { id: "p6",  nombre: "Salmón grillado",         descripcion: "Con vegetales salteados",       precio: 16_900, categoria: cat("c2"), tiempoPreparacion: 22, disponible: true,  vecesVendido: 19, imagen: null },
  { id: "p7",  nombre: "Pollo al verdeo",         descripcion: "Con puré rústico",              precio: 10_500, categoria: cat("c2"), tiempoPreparacion: 18, disponible: true,  vecesVendido: 28, imagen: null },
  { id: "p8",  nombre: "Sorrentinos j&q",         descripcion: "Con salsa a elección",          precio: 9_800,  categoria: cat("c3"), tiempoPreparacion: 15, disponible: true,  vecesVendido: 41, imagen: null },
  { id: "p9",  nombre: "Ñoquis caseros",          descripcion: "Con bolognesa o mixta",         precio: 8_500,  categoria: cat("c3"), tiempoPreparacion: 14, disponible: true,  vecesVendido: 36, imagen: null },
  { id: "p10", nombre: "Ravioles de verdura",     descripcion: "Con crema de hongos",           precio: 9_200,  categoria: cat("c3"), tiempoPreparacion: 15, disponible: true,  vecesVendido: 24, imagen: null },
  { id: "p11", nombre: "Flan casero",             descripcion: "Con dulce de leche y crema",    precio: 4_500,  categoria: cat("c4"), tiempoPreparacion: 5,  disponible: true,  vecesVendido: 39, imagen: null },
  { id: "p12", nombre: "Tiramisú",                descripcion: "Receta tradicional",            precio: 5_200,  categoria: cat("c4"), tiempoPreparacion: 5,  disponible: true,  vecesVendido: 26, imagen: null },
  { id: "p13", nombre: "Helado (2 bochas)",       descripcion: "Sabores a elección",            precio: 3_800,  categoria: cat("c4"), tiempoPreparacion: 3,  disponible: true,  vecesVendido: 33, imagen: null },
  { id: "p14", nombre: "Agua sin gas 500ml",      descripcion: "",                              precio: 1_800,  categoria: cat("c5"), tiempoPreparacion: 1,  disponible: true,  vecesVendido: 88, imagen: null },
  { id: "p15", nombre: "Gaseosa",                 descripcion: "Línea Coca-Cola",               precio: 2_200,  categoria: cat("c5"), tiempoPreparacion: 1,  disponible: true,  vecesVendido: 72, imagen: null },
  { id: "p16", nombre: "Cerveza artesanal pinta", descripcion: "IPA · Golden · Stout",          precio: 4_500,  categoria: cat("c5"), tiempoPreparacion: 2,  disponible: true,  vecesVendido: 61, imagen: null },
  { id: "p17", nombre: "Copa de vino malbec",     descripcion: "",                              precio: 3_900,  categoria: cat("c5"), tiempoPreparacion: 2,  disponible: true,  vecesVendido: 44, imagen: null },
];

export const carta: CategoriaConProductos[] = CAT.map((c) => ({
  ...c,
  productos: productos.filter((p) => p.categoria.id === c.id && p.disponible),
}));

// ── Comandas ─────────────────────────────────────────────────
export const comandas: Comanda[] = [
  {
    id: "cm1", numero: 1,
    mesa: { id: "m3", numero: 3, sector: "salon" },
    mozo: { id: "u2", nombre: "Marcos Mozo" },
    estado: "pendiente",
    items: [
      { _id: "i1", producto: "p1",  nombre: "Empanadas de carne (x3)", precio: 4_200, cantidad: 2, notas: "Una sin aceituna", estado: "pendiente" },
      { _id: "i2", producto: "p15", nombre: "Gaseosa",                 precio: 2_200, cantidad: 2, notas: "",                 estado: "pendiente" },
    ],
    total: 12_800, observaciones: "",
    enviadaEn: hace(4), listaEn: null, entregadaEn: null, pagadaEn: null, metodoPago: null,
    createdAt: hace(4),
  },
  {
    id: "cm2", numero: 2,
    mesa: { id: "m5", numero: 5, sector: "salon" },
    mozo: { id: "u3", nombre: "Lucía Mozo" },
    estado: "en_preparacion",
    items: [
      { _id: "i3", producto: "p4", nombre: "Bife de chorizo", precio: 14_500, cantidad: 2, notas: "Uno a punto, otro jugoso", estado: "en_preparacion" },
      { _id: "i4", producto: "p9", nombre: "Ñoquis caseros",  precio: 8_500,  cantidad: 1, notas: "",                         estado: "listo" },
    ],
    total: 37_500, observaciones: "Cumpleaños — traer postre con vela",
    enviadaEn: hace(18), listaEn: null, entregadaEn: null, pagadaEn: null, metodoPago: null,
    createdAt: hace(18),
  },
  {
    id: "cm3", numero: 3,
    mesa: { id: "m9", numero: 9, sector: "terraza" },
    mozo: { id: "u2", nombre: "Marcos Mozo" },
    estado: "lista",
    items: [
      { _id: "i5", producto: "p11", nombre: "Flan casero", precio: 4_500, cantidad: 3, notas: "", estado: "listo" },
    ],
    total: 13_500, observaciones: "",
    enviadaEn: hace(9), listaEn: hace(1), entregadaEn: null, pagadaEn: null, metodoPago: null,
    createdAt: hace(9),
  },
  {
    id: "cm4", numero: 4,
    mesa: { id: "m7", numero: 7, sector: "salon" },
    mozo: { id: "u2", nombre: "Marcos Mozo" },
    estado: "entregada",
    items: [
      { _id: "i6", producto: "p5",  nombre: "Milanesa napolitana",     precio: 11_800, cantidad: 3, notas: "", estado: "entregado" },
      { _id: "i7", producto: "p16", nombre: "Cerveza artesanal pinta", precio: 4_500,  cantidad: 3, notas: "", estado: "entregado" },
    ],
    total: 48_900, observaciones: "",
    enviadaEn: hace(55), listaEn: hace(35), entregadaEn: hace(30), pagadaEn: null, metodoPago: null,
    createdAt: hace(55),
  },
];

// ── Notificaciones ───────────────────────────────────────────
export const notificaciones: Notificacion[] = [
  { id: "n1", tipo: "comanda_lista", mensaje: "Comanda #3 lista para servir (mesa 9)", leida: false, mesa: 9, createdAt: hace(1) },
  { id: "n2", tipo: "mesa_cuenta",   mensaje: "La mesa 7 pidió la cuenta",             leida: false, mesa: 7, createdAt: hace(6) },
  { id: "n3", tipo: "sistema",       mensaje: "Se actualizó el menú del día",           leida: true,  mesa: null, createdAt: hace(60) },
];

// ── Métricas ─────────────────────────────────────────────────
export const statsComandas: StatsComandas = {
  comandasHoy: 14,
  ventasHoy: 312_400,
  ticketPromedio: 22_314,
  tiempoPromedioPreparacion: 16.4,
  comandasPagadas: 10,
  porEstado: { pendiente: 1, en_preparacion: 1, lista: 1, entregada: 1, pagada: 10 },
};

export const statsMesas: StatsMesas = {
  total: 12,
  libres: 6,
  ocupadas: 4,
  cuenta: 1,
  ocupacion: 50,
};
