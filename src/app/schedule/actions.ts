"use server";

import { PrismaClient } from "@prisma/client/extension";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createAndScheduleOrder(formData: FormData) {
  const styleName = formData.get("styleName") as string;
  const categoryId = parseInt(formData.get("categoryId") as string);
  const totalUnits = parseInt(formData.get("totalUnits") as string);
  const shipDateStart = new Date(formData.get("shipDateStart") as string);
  const shipDateEnd = new Date(formData.get("shipDateEnd") as string);
  const lineId = parseInt(formData.get("lineId") as string);
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);

  // 1. Transactionally insert into both tables safely
  await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        styleName,
        categoryId,
        totalUnits,
        shipDateStart,
        shipDateEnd,
      },
    });

    await tx.lineAllocation.create({
      data: {
        orderId: newOrder.id,
        lineId,
        startDate,
        endDate,
      },
    });
  });

  // 2. Clear cache for the heatmap dashboard so it shows new allocations instantly
  revalidatePath("/");
}
