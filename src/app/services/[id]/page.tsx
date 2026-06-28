import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { StatusDot } from "@/components/monitors/StatusDot";
import { UptimeBar } from "@/components/monitors/UptimeBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServicePage({ params }: Props) {
  const { id } = await params;

  const monitor = await prisma.monitor.findUnique({
    where: { id },
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 288,
      },
      incidents: {
        orderBy: { startedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!monitor) notFound();

  const latest = monitor.checks[0] ?? null;
  const checks24h = monitor.checks.slice(0, 288);
  const upCount = checks24h.filter((c) => c.status === "UP").length;
  const uptimePct =
    checks24h.length > 0
      ? (upCount / checks24h.length) * 100
      : null;

  const avgLatency =
    checks24h.filter((c) => c.latency !== null).length > 0
      ? checks24h.filter((c) => c.latency !== null).reduce((s, c) => s + (c.latency ?? 0), 0) /
        checks24h.filter((c) => c.latency !== null).length
      : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al dashboard
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusDot status={latest?.status ?? null} />
              <h1 className="text-2xl font-bold">{monitor.name}</h1>
            </div>
            {monitor.description && (
              <p className="text-muted-foreground text-sm">{monitor.description}</p>
            )}
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {monitor.url} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <StatusBadge status={latest?.status ?? null} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Uptime 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {uptimePct !== null ? `${uptimePct.toFixed(1)}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Latencia promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {avgLatency !== null ? `${Math.round(avgLatency)} ms` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Última verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {latest
                ? format(new Date(latest.checkedAt), "HH:mm", { locale: es })
                : "—"}
            </p>
            {latest && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(latest.checkedAt), "d MMM yyyy", { locale: es })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Historial de verificaciones (últimas 48h)</CardTitle>
        </CardHeader>
        <CardContent>
          <UptimeBar
            checks={monitor.checks.map((c) => ({
              status: c.status,
              checkedAt: c.checkedAt,
              latency: c.latency,
            }))}
            slots={96}
          />
        </CardContent>
      </Card>

      {monitor.incidents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Incidentes recientes</h2>
          <div className="space-y-2">
            {monitor.incidents.map((inc) => (
              <div
                key={inc.id}
                className={`rounded-lg border p-4 text-sm ${
                  inc.resolvedAt
                    ? "bg-muted/50"
                    : "bg-red-500/5 border-red-500/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{inc.title}</p>
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
                {inc.description && (
                  <p className="text-muted-foreground mt-1">{inc.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(inc.startedAt), "d MMM yyyy, HH:mm", { locale: es })}
                  {inc.resolvedAt &&
                    ` → ${format(new Date(inc.resolvedAt), "HH:mm", { locale: es })}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
