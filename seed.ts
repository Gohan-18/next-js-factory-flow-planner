// seed.ts
import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("🌱 Populating database masters...");

  const cat1 = await prisma.category.upsert({
    where: { name: "Premium Hoodie" },
    update: {},
    create: {
      name: "Premium Hoodie",
      samCut: 2.5,
      samSew: 15.0,
      samFinish: 4.0,
      samPack: 1.5,
    },
  });

  await prisma.line.upsert({
    where: { name: "Line Alpha" },
    update: {},
    create: {
      name: "Line Alpha",
      manpowerCut: 5,
      manpowerSew: 25,
      manpowerFinish: 8,
      manpowerPack: 4,
    },
  });

  console.log("✅ Base entries loaded into Supabase tables successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
