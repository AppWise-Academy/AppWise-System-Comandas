import { useState } from "react";
import { useNotificaciones, useMarcarLeidas } from "../hooks/queries";

export function Notificaciones() {
  const { data: notifs = [] } = useNotificaciones();
  const marcar = useMarcarLeidas();
  const [open, setOpen] = useState(false);
  const noLeidas = notifs.filter((n) => !n.leida).length;

  const toggle = () => {
    setOpen((v) => !v);
    if (!open && noLeidas > 0) marcar.mutate();
  };

  return (
    <div className="relative">
      <button onClick={toggle} className="relative rounded-lg p-1.5 text-xl hover:bg-slate-100">
        🔔
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="px-3 py-2.5 font-semibold text-sm border-b border-slate-100">Notificaciones</div>
            {notifs.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Sin notificaciones</p>
            ) : (
              notifs.slice(0, 10).map((n) => (
                <div key={n.id} className={`px-3 py-2.5 border-b border-slate-50 text-sm last:border-0 ${n.leida ? "" : "bg-orange-50"}`}>
                  <p className="text-slate-700">{n.mensaje}</p>
                  <time className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </time>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
