import { PrismaClient } from "@prisma/client";
import { SENA_SERVICES } from "../src/lib/monitors";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding monitors...");

  for (const service of SENA_SERVICES) {
    await prisma.monitor.upsert({
      where: { name: service.name } as never,
      update: {},
      create: service,
    });
  }

  console.log(`Seeded ${SENA_SERVICES.length} monitors.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
