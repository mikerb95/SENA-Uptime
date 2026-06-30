import { prisma } from "@/lib/prisma";
import { getOverallStats } from "@/lib/monitors";
import { getOpenInscriptionWindows } from "@/lib/inscription-windows";
import { MonitorCard } from "@/components/monitors/MonitorCard";
import { OverallStatus } from "@/components/monitors/OverallStatus";
import { InscriptionWindows } from "@/components/monitors/InscriptionWindows";
import { RefreshCw } from "lucide-react";

export const revalidate = 60;

async function getMonitorsData() {
  const monitors = await prisma.monitor.findMany({
    where: { active: true },
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 48,
      },
    },
    orderBy: { name: "asc" },
  });

  return monitors.map((m) => {
    const latest = m.checks[0] ?? null;
    const upCount = m.checks.filter((c) => c.status === "UP").length;
    const uptimePct =
      m.checks.length > 0
        ? Math.round((upCount / m.checks.length) * 1000) / 10
        : null;

    return {
      id: m.id,
      name: m.name,
      url: m.url,
      description: m.description,
      category: m.category,
      currentStatus: latest?.status ?? null,
      lastLatency: latest?.latency ?? null,
      recentChecks: m.checks.map((c) => ({
        status: c.status,
        checkedAt: c.checkedAt,
        latency: c.latency,
      })),
      uptimePct,
    };
  });
}

export default async function HomePage() {
  let monitors: Awaited<ReturnType<typeof getMonitorsData>> = [];
  let stats = { total: 0, up: 0, down: 0, degraded: 0 };
  let windows: Awaited<ReturnType<typeof getOpenInscriptionWindows>> = [];
  let hasData = false;

  try {
    [monitors, stats, windows] = await Promise.all([
      getMonitorsData(),
      getOverallStats(),
      getOpenInscriptionWindows(),
    ]);
    hasData = monitors.length > 0;
  } catch {
    // DB no configurada aún
  }

  const categories = [...new Set(monitors.map((m) => m.category))];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estado de los Servicios SENA</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitoreo en tiempo real de la infraestructura digital del SENA Colombia
        </p>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground space-y-2">
          <p className="font-medium">Aún no hay datos de monitoreo</p>
          <p className="text-sm">
            Configura la base de datos y ejecuta el seed para comenzar.
          </p>
        </div>
      ) : (
        <>
          <OverallStatus {...stats} />

          {categories.map((cat) => {
            const catMonitors = monitors.filter((m) => m.category === cat);
            return (
              <section key={cat} className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {catMonitors.map((m) => (
                    <MonitorCard key={m.id} {...m} />
                  ))}
                </div>
              </section>
            );
          })}

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3" />
            Se actualiza automáticamente cada 5 minutos
          </p>
        </>
      )}
    </div>
  );
}
