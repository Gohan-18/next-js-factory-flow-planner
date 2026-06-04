// src/app/api/meta/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [categories, lines] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.line.findMany({ select: { id: true, name: true } }),
    ]);
    return NextResponse.json({ categories, lines });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve metadata master definitions." },
      { status: 500 },
    );
  }
}
