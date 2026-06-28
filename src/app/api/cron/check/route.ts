import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pingService } from "@/lib/monitors";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monitors = await prisma.monitor.findMany({ where: { active: true } });

  const results = await Promise.allSettled(
    monitors.map(async (monitor) => {
      const { status, latency, statusCode } = await pingService(monitor.url);

      await prisma.check.create({
        data: { monitorId: monitor.id, status, latency, statusCode },
      });

      const lastCheck = await prisma.check.findFirst({
        where: { monitorId: monitor.id },
        orderBy: { checkedAt: "desc" },
        skip: 1,
      });

      if (lastCheck?.status !== "DOWN" && status === "DOWN") {
        await prisma.incident.create({
          data: {
            monitorId: monitor.id,
            title: `${monitor.name} no disponible`,
            description: `El servicio respondió con código ${statusCode ?? "sin respuesta"}`,
          },
        });
      }

      if (lastCheck?.status === "DOWN" && status !== "DOWN") {
        await prisma.incident.updateMany({
          where: { monitorId: monitor.id, resolvedAt: null },
          data: { resolvedAt: new Date() },
        });
      }

      return { id: monitor.id, name: monitor.name, status };
    })
  );

  const summary = results.map((r) =>
    r.status === "fulfilled" ? r.value : { error: r.reason }
  );

  return NextResponse.json({ checked: monitors.length, summary });
}
