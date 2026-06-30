import { prisma } from "./prisma";

/**
 * Ventanas de inscripción: el dolor #1 de la comunidad SENA es que Sofía Plus
 * se cae justo cuando abren inscripciones. Estas funciones permiten (1) avisar
 * en tiempo real si la plataforma está disponible durante una ventana abierta y
 * (2) auditar a posteriori cuánto estuvo caída durante el periodo crítico.
 */

export type WindowState = "upcoming" | "open" | "closed";

export function windowState(
  win: { opensAt: Date; closesAt: Date },
  now: Date = new Date()
): WindowState {
  if (now < win.opensAt) return "upcoming";
  if (now >= win.closesAt) return "closed";
  return "open";
}

/** Ventanas activas (open o upcoming) con el último estado de su monitor. */
export async function getOpenInscriptionWindows(now: Date = new Date()) {
  const windows = await prisma.inscriptionWindow.findMany({
    where: { active: true, closesAt: { gte: now } },
    orderBy: { opensAt: "asc" },
    include: {
      monitor: {
        include: {
          checks: { orderBy: { checkedAt: "desc" }, take: 1 },
        },
      },
    },
  });

  return windows.map((w) => ({
    id: w.id,
    title: w.title,
    opensAt: w.opensAt,
    closesAt: w.closesAt,
    state: windowState(w, now),
    monitor: {
      id: w.monitor.id,
      name: w.monitor.name,
      url: w.monitor.url,
    },
    currentStatus: w.monitor.checks[0]?.status ?? null,
    lastLatency: w.monitor.checks[0]?.latency ?? null,
  }));
}

/**
 * Disponibilidad del servicio DURANTE la ventana (acotada a "hasta ahora" si
 * sigue abierta). Esta es la métrica de auditoría: evidencia de si la
 * plataforma respondió cuando la comunidad la necesitaba.
 */
export async function getWindowUptime(
  windowId: string,
  now: Date = new Date()
) {
  const win = await prisma.inscriptionWindow.findUnique({
    where: { id: windowId },
  });
  if (!win) return null;

  const until = win.closesAt < now ? win.closesAt : now;

  const checks = await prisma.check.findMany({
    where: {
      monitorId: win.monitorId,
      checkedAt: { gte: win.opensAt, lte: until },
    },
    select: { status: true },
  });

  const total = checks.length;
  if (total === 0) {
    return { uptimePct: null, downChecks: 0, totalChecks: 0 };
  }

  const up = checks.filter((c) => c.status === "UP").length;
  const down = checks.filter((c) => c.status === "DOWN").length;

  return {
    uptimePct: Math.round((up / total) * 1000) / 10,
    downChecks: down,
    totalChecks: total,
  };
}
