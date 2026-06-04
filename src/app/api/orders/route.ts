// import { NextResponse } from "next/server";
// import { inMemoryAllocations } from "@/lib/serverStore";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     // Server-side business logic validation
//     if (
//       !body.styleName ||
//       !body.categoryId ||
//       !body.totalUnits ||
//       !body.lineId ||
//       !body.startDate ||
//       !body.endDate
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Missing parameters in submission request payload.",
//         },
//         { status: 400 },
//       );
//     }

//     if (new Date(body.startDate) > new Date(body.endDate)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid Timeline: Start date cannot exceed wrap up date.",
//         },
//         { status: 400 },
//       );
//     }

//     // Append submission directly into our in-memory data array
//     const newAllocation = {
//       id: `gen-${Math.random().toString(36).substr(2, 9)}`,
//       styleName: body.styleName,
//       categoryId: parseInt(body.categoryId),
//       totalUnits: parseInt(body.totalUnits),
//       startDate: body.startDate,
//       endDate: body.endDate,
//       lineId: parseInt(body.lineId),
//     };

//     inMemoryAllocations.push(newAllocation);

//     return NextResponse.json({
//       success: true,
//       message: "Order scheduled and committed successfully!",
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: "Internal Server Parsing Crash." },
//       { status: 500 },
//     );
//   }
// }

// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Server-side business logic validation
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

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Timeline Conflict: Start date cannot be after end date.",
        },
        { status: 400 },
      );
    }

    // Run the order creation and line scheduling inside a secure database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the base Order record
      const newOrder = await tx.order.create({
        data: {
          styleName,
          categoryId: parseInt(categoryId),
          totalUnits: parseInt(totalUnits),
          shipDateStart: new Date(shipDateStart),
          shipDateEnd: new Date(shipDateEnd),
        },
      });

      // 2. Create the companion Floor Allocation schedule
      const newAllocation = await tx.lineAllocation.create({
        data: {
          orderId: newOrder.id,
          lineId: parseInt(lineId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      return { newOrder, newAllocation };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully scheduled order ${result.newOrder.id.slice(0, 8)} on Line ${lineId}!`,
    });
  } catch (error) {
    console.error("Database Ingestion Failure:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Database Processing Crash." },
      { status: 500 },
    );
  }
}
