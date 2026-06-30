import { StatusBadge } from "./StatusBadge";
import { CalendarClock } from "lucide-react";
import type { CheckStatus } from "@prisma/client";

type Window = {
  id: string;
  title: string;
  opensAt: Date;
  closesAt: Date;
  state: "upcoming" | "open" | "closed";
  monitor: { id: string; name: string; url: string };
  currentStatus: CheckStatus | null;
};

const fmt = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function InscriptionWindows({ windows }: { windows: Window[] }) {
  if (windows.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <CalendarClock className="h-3.5 w-3.5" />
        Ventanas de inscripción
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {windows.map((w) => {
          const isOpen = w.state === "open";
          return (
            <div
              key={w.id}
              className={`rounded-xl border p-4 ${
                isOpen ? "border-emerald-500/40 bg-emerald-500/5" : "bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{w.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {w.monitor.name}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                    isOpen
                      ? "bg-emerald-500/15 text-emerald-700"
                      : "bg-slate-500/15 text-slate-600"
                  }`}
                >
                  {isOpen ? "Abierta" : "Próxima"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {fmt.format(w.opensAt)} — {fmt.format(w.closesAt)}
                </p>
                {isOpen && <StatusBadge status={w.currentStatus} />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
