import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SENA_SERVICES } from "@/lib/monitors";

// Solo disponible en desarrollo
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  await prisma.monitor.deleteMany();

  const monitors = await prisma.monitor.createMany({
    data: SENA_SERVICES,
  });

  // Ventana de inscripción de ejemplo, abierta ahora, atada a Sofía Plus.
  const sofia = await prisma.monitor.findFirst({
    where: { name: "Sofía Plus" },
  });

  let windows = 0;
  if (sofia) {
    const now = new Date();
    const opensAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // hace 2 días
    const closesAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // en 5 días
    await prisma.inscriptionWindow.create({
      data: {
        monitorId: sofia.id,
        title: "Inscripciones 2026-2 — Tecnólogos",
        opensAt,
        closesAt,
      },
    });
    windows = 1;
  }

  return NextResponse.json({ created: monitors.count, windows });
}
