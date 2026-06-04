import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateLineTimelineCapacity } from "@/lib/capacityValidator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      styleName,
      categoryId,
      totalUnits,
      shipDateStart,
      shipDateEnd,
      lineId,
      startDate,
      endDate,
    } = body;

    if (
      !styleName ||
      !categoryId ||
      !totalUnits ||
      !lineId ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing parameters in submission request.",
        },
        { status: 400 },
      );
    }

    const targetLineId = parseInt(lineId);
    const targetCategoryId = parseInt(categoryId);
    const incomingUnits = parseInt(totalUnits);

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Timeline Conflict: Start date cannot be after end date.",
        },
        { status: 400 },
      );
    }

    // Fetch active floor data from Supabase
    const [targetLine, targetCategory, overlappingAllocations] =
      await Promise.all([
        prisma.line.findUnique({ where: { id: targetLineId } }),
        prisma.category.findUnique({ where: { id: targetCategoryId } }),
        prisma.lineAllocation.findMany({
          where: {
            lineId: targetLineId,
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
          include: { order: { include: { category: true } } },
        }),
      ]);

    if (!targetLine || !targetCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Target production configuration assets do not exist.",
        },
        { status: 404 },
      );
    }

    // Run the isolated validation calculation helper
    const validation = validateLineTimelineCapacity(
      { startDate, endDate, totalUnits: incomingUnits },
      targetLine,
      targetCategory,
      overlappingAllocations,
    );

    // Block database write operations if line capacity limits are breached
    if (!validation.isSafe) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 402 },
      );
    }

    // Execute safe transaction commit since layout criteria passed perfectly
    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          styleName,
          categoryId: targetCategoryId,
          totalUnits: incomingUnits,
          shipDateStart: new Date(shipDateStart),
          shipDateEnd: new Date(shipDateEnd),
        },
      });

      const newAllocation = await tx.lineAllocation.create({
        data: {
          orderId: newOrder.id,
          lineId: targetLineId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      return { newOrder, newAllocation };
    });

    return NextResponse.json({
      success: true,
      message: `Success! Order ${result.newOrder.id.slice(0, 8)} successfully committed to the production schedule.`,
    });
  } catch (error) {
    console.error("Database Gatekeeper Processing Failure:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Database Processing Crash." },
      { status: 500 },
    );
  }
}
