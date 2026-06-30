import { getMonthlySlaForAll } from "@/lib/sla";
import { FileBarChart } from "lucide-react";

export const revalidate = 60;

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function slaColor(pct: number): string {
  if (pct >= 99) return "text-emerald-600";
  if (pct >= 95) return "text-amber-600";
  return "text-red-600";
}

export default async function ReportesPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  let rows: Awaited<ReturnType<typeof getMonthlySlaForAll>> = [];
  let hasData = false;

  try {
    rows = await getMonthlySlaForAll(year, month);
    hasData = rows.some((r) => r.sla.totalChecks > 0);
  } catch {
    // BD no configurada aún
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileBarChart className="h-6 w-6 text-emerald-600" />
          Reporte de disponibilidad
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Auditoría independiente de la disponibilidad de los servicios del SENA
          durante {MESES[month - 1]} {year}. Datos medidos cada 5 minutos desde
          una fuente externa.
        </p>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground space-y-2">
          <p className="font-medium">Aún no hay suficientes datos este mes</p>
          <p className="text-sm">
            El reporte se construye con los chequeos acumulados del mes en curso.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Servicio</th>
                <th className="px-4 py-3 text-right font-medium">Disponibilidad</th>
                <th className="px-4 py-3 text-right font-medium">Caído</th>
                <th className="px-4 py-3 text-right font-medium">Latencia media</th>
                <th className="px-4 py-3 text-right font-medium">Incidentes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.category}</div>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold tabular-nums ${slaColor(r.sla.uptimePct)}`}>
                    {r.sla.totalChecks > 0 ? `${r.sla.uptimePct}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {r.sla.totalChecks > 0 ? `${r.sla.downPct}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {r.sla.avgLatency !== null ? `${r.sla.avgLatency} ms` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {r.sla.incidents}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        La disponibilidad se calcula como el porcentaje de chequeos con respuesta
        satisfactoria sobre el total de chequeos del periodo.
      </p>
    </div>
  );
}
