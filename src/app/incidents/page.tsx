import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export default async function IncidentsPage() {
  let incidents: Array<{
    id: string;
    title: string;
    description: string | null;
    startedAt: Date;
    resolvedAt: Date | null;
    monitor: { id: string; name: string };
  }> = [];

  try {
    incidents = await prisma.incident.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
      include: {
        monitor: { select: { id: true, name: true } },
      },
    });
  } catch {
    // DB no configurada
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al dashboard
        </Link>
        <h1 className="text-2xl font-bold">Historial de Incidentes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Registro de interrupciones y degradaciones detectadas
        </p>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
          <p className="font-medium">Sin incidentes registrados</p>
          <p className="text-sm">Todo ha funcionado correctamente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className={`rounded-lg border p-4 ${
                inc.resolvedAt
                  ? "bg-background"
                  : "bg-red-500/5 border-red-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                {inc.resolvedAt ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0 animate-pulse" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{inc.title}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        inc.resolvedAt
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-red-500/15 text-red-700"
                      }`}
                    >
                      {inc.resolvedAt ? "Resuelto" : "Activo"}
                    </span>
                  </div>
                  <Link
                    href={`/services/${inc.monitor.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {inc.monitor.name}
                  </Link>
                  {inc.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {inc.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Inicio:{" "}
                    {format(new Date(inc.startedAt), "d MMM yyyy, HH:mm", {
                      locale: es,
                    })}
                    {inc.resolvedAt && (
                      <>
                        {" "}· Fin:{" "}
                        {format(new Date(inc.resolvedAt), "HH:mm", {
                          locale: es,
                        })}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
