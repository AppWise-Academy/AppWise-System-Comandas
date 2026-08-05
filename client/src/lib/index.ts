export const plata = (n: number) => `$${n.toLocaleString("es-AR")}`;

export const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const minutosDesde = (iso: string) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
