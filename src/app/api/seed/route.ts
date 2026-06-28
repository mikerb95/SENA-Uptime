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

  return NextResponse.json({ created: monitors.count });
}
