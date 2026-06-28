import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  total: number;
  up: number;
  down: number;
  degraded: number;
}

export function OverallStatus({ total, up, down, degraded }: Props) {
  const allUp = down === 0 && degraded === 0;
  const hasDown = down > 0;

  return (
    <div
      className={`rounded-xl border p-5 flex items-center gap-4 ${
        allUp
          ? "bg-emerald-500/10 border-emerald-500/30"
          : hasDown
            ? "bg-red-500/10 border-red-500/30"
            : "bg-amber-500/10 border-amber-500/30"
      }`}
    >
      {allUp ? (
        <CheckCircle className="h-8 w-8 text-emerald-600 shrink-0" />
      ) : hasDown ? (
        <XCircle className="h-8 w-8 text-red-600 shrink-0" />
      ) : (
        <AlertTriangle className="h-8 w-8 text-amber-600 shrink-0" />
      )}
      <div>
        <p className="text-lg font-semibold">
          {allUp
            ? "Todos los sistemas operativos"
            : hasDown
              ? `${down} servicio${down > 1 ? "s" : ""} caído${down > 1 ? "s" : ""}`
              : `${degraded} servicio${degraded > 1 ? "s" : ""} con rendimiento degradado`}
        </p>
        <p className="text-sm text-muted-foreground">
          {up} de {total} servicios funcionando correctamente
        </p>
      </div>
    </div>
  );
}
