import { prisma } from "./prisma";

/**
 * Reporte SLA: agrega los `Check` de un periodo para producir evidencia
 * histórica e independiente de la disponibilidad de cada servicio del SENA.
 * Esto es lo que convierte el proyecto de "status page" en "auditor externo".
 */

export type SlaReport = {
  uptimePct: number;
  degradedPct: number;
  downPct: number;
  avgLatency: number | null;
  totalChecks: number;
  incidents: number;
};

function summarizeChecks(
  checks: { status: string; latency: number | null }[]
): Omit<SlaReport, "incidents"> {
  const total = checks.length;
  if (total === 0) {
    return {
      uptimePct: 0,
      degradedPct: 0,
      downPct: 0,
      avgLatency: null,
      totalChecks: 0,
    };
  }

  const up = checks.filter((c) => c.status === "UP").length;
  const degraded = checks.filter((c) => c.status === "DEGRADED").length;
  const down = checks.filter((c) => c.status === "DOWN").length;
  const withLatency = checks.filter((c) => c.latency !== null);

  const pct = (n: number) => Math.round((n / total) * 1000) / 10;

  return {
    uptimePct: pct(up),
    degradedPct: pct(degraded),
    downPct: pct(down),
    avgLatency: withLatency.length
      ? Math.round(
          withLatency.reduce((s, c) => s + (c.latency ?? 0), 0) /
            withLatency.length
        )
      : null,
    totalChecks: total,
  };
}

/** Rango [inicio, fin) del mes indicado, en hora local del servidor. */
export function monthRange(year: number, month: number) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);
  return { from, to };
}

/** Reporte SLA de un monitor para un mes calendario. */
export async function getMonthlySla(
  monitorId: string,
  year: number,
  month: number
): Promise<SlaReport> {
  const { from, to } = monthRange(year, month);

  const [checks, incidents] = await Promise.all([
    prisma.check.findMany({
      where: { monitorId, checkedAt: { gte: from, lt: to } },
      select: { status: true, latency: true },
    }),
    prisma.incident.count({
      where: { monitorId, startedAt: { gte: from, lt: to } },
    }),
  ]);

  return { ...summarizeChecks(checks), incidents };
}

/** Reporte SLA mensual de todos los monitores activos, para la página pública. */
export async function getMonthlySlaForAll(year: number, month: number) {
  const monitors = await prisma.monitor.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true },
  });

  return Promise.all(
    monitors.map(async (m) => ({
      ...m,
      sla: await getMonthlySla(m.id, year, month),
    }))
  );
}
