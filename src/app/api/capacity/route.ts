import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCapacityMatrix } from "@/lib/capacityEngine";

export async function GET() {
  try {
    // Pull all fresh configurations and allocations from Supabase concurrently
    const [lines, categories, allocations] = await Promise.all([
      prisma.line.findMany(),
      prisma.category.findMany(),
      prisma.lineAllocation.findMany({
        include: {
          order: true,
        },
      }),
    ]);

    // Format the database models to match the capacity engine interface
    const formattedAllocations = allocations.map((alloc) => ({
      id: alloc.id,
      styleName: alloc.order.styleName,
      categoryId: alloc.order.categoryId,
      totalUnits: alloc.order.totalUnits,
      startDate: alloc.startDate.toISOString().split("T")[0],
      endDate: alloc.endDate.toISOString().split("T")[0],
      lineId: alloc.lineId,
    }));

    // Compute metrics using the capacity engine
    const matrixData = computeCapacityMatrix(
      formattedAllocations,
      lines,
      categories,
    );

    return NextResponse.json(matrixData);
  } catch (error) {
    console.error("Capacity Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to compute capacity matrix." },
      { status: 500 },
    );
  }
}
