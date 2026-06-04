// test-db.ts
import { prisma } from "./src/lib/prisma"; // Make sure this path points to your client file

async function runDiagnostics() {
  console.log("🚀 Starting Database Connection Diagnostics...\n");

  try {
    // 1. Force a simple low-level raw SQL query to test network handshake
    console.log("🔄 Attemping connection handshake via raw query...");
    const timestamp = await prisma.$queryRaw`SELECT NOW();`;
    console.log("✅ Network Handshake Successful!");
    console.log(`⏱️ PostgreSQL Server Time:`, (timestamp as any)[0].now);

    console.log("\n----------------------------------------\n");

    // 2. Test ORM Engine & Schema compilation
    console.log("🔄 Checking if schema models are accessible...");
    const lineCount = await prisma.line.count();
    console.log(
      `✅ Prisma ORM Operational! Found ${lineCount} existing lines in the database.`,
    );

    console.log(
      "\n🎉 ALL SYSTEMS GO: Your Prisma 7 connection is perfectly set up!",
    );
  } catch (error: any) {
    console.error("\n❌ Database Connection Failed!");
    console.error("────────────────────────────────────────");
    console.error(`Error Message: ${error.message}`);
    console.error("────────────────────────────────────────\n");
    console.error("💡 Troubleshooting Checklist:");
    console.error(
      "1. Check if your PostgreSQL local server is actually running.",
    );
    console.error(
      "2. Ensure your DATABASE_URL string in your .env file has the correct password and port (usually 5432).",
    );
    console.error(
      '3. Make sure you ran "npx prisma db push" or your migrations to create the tables.',
    );
  } finally {
    // Gracefully disconnect the client pool
    await prisma.$disconnect();
    process.exit();
  }
}

runDiagnostics();
