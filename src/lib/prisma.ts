// // src/lib/prisma.ts
// import { Pool } from "pg";
// import { PrismaPg } from "@prisma/adapter-pg";

// // CRITICAL: Ensure this path points exactly to where your schema's "output" is generated
// import { PrismaClient } from "../generated/prisma/client";

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL); // Debug log to verify env variable is loaded

// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);

// export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// src/lib/prisma.ts
import "dotenv/config"; // <-- CRITICAL: Forces environment variables to load immediately!
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Debug log to verify the environment variable is now loaded cleanly
console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
