import { prisma } from "@/lib/prisma";
import { windowState } from "@/lib/inscription-windows";
import {
  isAuthed,
  unlock,
  logout,
  createWindow,
  toggleWindow,
  deleteWindow,
} from "./actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Lock, CalendarPlus, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40";

const STATE_LABEL: Record<string, string> = {
  open: "Abierta",
  upcoming: "Próxima",
  closed: "Cerrada",
};

export default async function AdminVentanasPage() {
  const authed = await isAuthed();

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto space-y-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          Panel de administración
        </h1>
        <form action={unlock} className="space-y-3">
          <input
            type="password"
            name="secret"
            placeholder="Clave de administrador"
            className={inputCls}
            autoFocus
          />
          <button
            type="submit"
            className="w-full rounded-md bg-foreground text-background py-2 text-sm font-medium hover:opacity-90"
          >
            Entrar
          </button>
        </form>
        <p className="text-xs text-muted-foreground">
          Protección temporal con <code>ADMIN_SECRET</code> hasta el auth de la
          Fase 3.
        </p>
      </div>
    );
  }

  const [monitors, windows] = await Promise.all([
    prisma.monitor.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.inscriptionWindow.findMany({
      orderBy: { opensAt: "desc" },
      include: { monitor: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Ventanas de inscripción
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestiona los periodos de inscripción que se auditan en tiempo real.
          </p>
        </div>
        <form action={logout}>
          <button className="text-xs text-muted-foreground hover:text-foreground">
            Salir
          </button>
        </form>
      </div>

      <section className="rounded-xl border p-5 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <CalendarPlus className="h-4 w-4 text-emerald-600" />
          Nueva ventana
        </h2>
        <form action={createWindow} className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground text-xs">Servicio</span>
            <select name="monitorId" required className={inputCls}>
              {monitors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground text-xs">Título</span>
            <input
              name="title"
              required
              placeholder="Inscripciones 2026-2 — Tecnólogos"
              className={inputCls}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground text-xs">Apertura</span>
            <input type="datetime-local" name="opensAt" required className={inputCls} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground text-xs">Cierre</span>
            <input type="datetime-local" name="closesAt" required className={inputCls} />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
            >
              Crear ventana
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ventanas existentes
        </h2>
        {windows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay ventanas. Crea la primera arriba.
          </p>
        ) : (
          <div className="space-y-2">
            {windows.map((w) => {
              const state = windowState(w);
              return (
                <div
                  key={w.id}
                  className={`rounded-lg border p-4 flex items-center justify-between gap-4 ${
                    w.active ? "" : "opacity-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{w.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {w.monitor.name} ·{" "}
                      {format(new Date(w.opensAt), "d MMM HH:mm", { locale: es })} →{" "}
                      {format(new Date(w.closesAt), "d MMM yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs rounded-full bg-muted px-2 py-0.5">
                      {STATE_LABEL[state]}
                    </span>
                    <form action={toggleWindow.bind(null, w.id, !w.active)}>
                      <button className="text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1">
                        {w.active ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                    <form action={deleteWindow.bind(null, w.id)}>
                      <button
                        className="text-muted-foreground hover:text-red-600 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
