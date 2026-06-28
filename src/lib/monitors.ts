import { prisma } from "./prisma";
import { CheckStatus } from "@prisma/client";

export const SENA_SERVICES = [
  {
    name: "Portal SENA",
    url: "https://www.sena.edu.co",
    description: "Sitio web institucional del SENA",
    category: "portal",
  },
  {
    name: "Sofía Plus",
    url: "https://sofia2.sena.edu.co",
    description: "Sistema de gestión de la formación profesional",
    category: "formacion",
  },
  {
    name: "Blackboard",
    url: "https://senasofiaplus.blackboard.com",
    description: "Plataforma virtual de aprendizaje",
    category: "formacion",
  },
  {
    name: "SENA Noticias",
    url: "https://noticias.sena.edu.co",
    description: "Portal de noticias institucionales",
    category: "portal",
  },
  {
    name: "SENA Empleo",
    url: "https://www.senasofiaplus.edu.co/sofia-oferta",
    description: "Portal de empleo y oferta educativa",
    category: "servicios",
  },
  {
    name: "Repositorio SENA",
    url: "https://repositorio.sena.edu.co",
    description: "Repositorio de objetos de aprendizaje",
    category: "recursos",
  },
];

export async function pingService(url: string): Promise<{
  status: CheckStatus;
  latency: number | null;
  statusCode: number | null;
}> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);
    const latency = Date.now() - start;
    const statusCode = res.status;

    let status: CheckStatus;
    if (statusCode >= 200 && statusCode < 400) {
      status = latency > 5000 ? CheckStatus.DEGRADED : CheckStatus.UP;
    } else {
      status = CheckStatus.DOWN;
    }

    return { status, latency, statusCode };
  } catch {
    return { status: CheckStatus.DOWN, latency: null, statusCode: null };
  }
}

export async function getMonitorsWithStatus() {
  const monitors = await prisma.monitor.findMany({
    where: { active: true },
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  return monitors.map((m) => ({
    ...m,
    currentStatus: m.checks[0]?.status ?? null,
    lastCheckedAt: m.checks[0]?.checkedAt ?? null,
    lastLatency: m.checks[0]?.latency ?? null,
  }));
}

export async function getMonitorUptimeStats(
  monitorId: string,
  hours: number = 24
) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const checks = await prisma.check.findMany({
    where: { monitorId, checkedAt: { gte: since } },
    orderBy: { checkedAt: "desc" },
  });

  if (checks.length === 0) return null;

  const upCount = checks.filter((c) => c.status === "UP").length;
  const uptimePct = Math.round((upCount / checks.length) * 1000) / 10;
  const avgLatency =
    checks.filter((c) => c.latency !== null).reduce((s, c) => s + (c.latency ?? 0), 0) /
    (checks.filter((c) => c.latency !== null).length || 1);

  return {
    uptimePct,
    avgLatency: Math.round(avgLatency),
    totalChecks: checks.length,
    checks,
  };
}

export async function getOverallStats() {
  const monitors = await prisma.monitor.findMany({
    where: { active: true },
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 1,
      },
    },
  });

  const total = monitors.length;
  const up = monitors.filter((m) => m.checks[0]?.status === "UP").length;
  const down = monitors.filter((m) => m.checks[0]?.status === "DOWN").length;
  const degraded = monitors.filter(
    (m) => m.checks[0]?.status === "DEGRADED"
  ).length;

  return { total, up, down, degraded };
}
