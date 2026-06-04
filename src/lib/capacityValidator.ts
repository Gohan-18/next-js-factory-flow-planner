// src/lib/utils/capacityValidator.ts

interface ValidationResult {
  isSafe: boolean;
  message: string;
  offendingDate?: string;
  offendingDepartment?: string;
  peakUtilization?: number;
}

interface IncomingPayload {
  startDate: string;
  endDate: string;
  totalUnits: number;
}

/**
 * Validates whether adding a proposed order timeline exceeds 100% capacity
 * on any given day for a specific production line.
 */
export function validateLineTimelineCapacity(
  incoming: IncomingPayload,
  targetLine: any,
  targetCategory: any,
  overlappingAllocations: any[],
): ValidationResult {
  const requestedStart = new Date(incoming.startDate);
  const requestedEnd = new Date(incoming.endDate);

  // Calculate the total duration of the proposed timeline
  const incomingTotalDays = Math.max(
    1,
    Math.round(
      (requestedEnd.getTime() - requestedStart.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1,
  );
  const incomingUnitsPerDay = incoming.totalUnits / incomingTotalDays;

  // Convert decimal properties from Prisma to plain floating numbers safely
  const samCut = Number(targetCategory.samCut);
  const samSew = Number(targetCategory.samSew);
  const samFinish = Number(targetCategory.samFinish);
  const samPack = Number(targetCategory.samPack);

  // Loop day-by-day through the proposed schedule window to spot single-day bottleneck overloads
  for (
    let d = new Date(requestedStart);
    d <= requestedEnd;
    d.setDate(d.getDate() + 1)
  ) {
    const currentDayStr = d.toISOString().split("T")[0];

    // Initialize daily minute counters with our proposed order's load
    let dailyCutMinutes = incomingUnitsPerDay * samCut;
    let dailySewMinutes = incomingUnitsPerDay * samSew;
    let dailyFinishMinutes = incomingUnitsPerDay * samFinish;
    let dailyPackMinutes = incomingUnitsPerDay * samPack;

    // Add workload contributions from orders already booked on this line
    overlappingAllocations.forEach((alloc) => {
      const allocStart = new Date(alloc.startDate).toISOString().split("T")[0];
      const allocEnd = new Date(alloc.endDate).toISOString().split("T")[0];

      if (currentDayStr >= allocStart && currentDayStr <= allocEnd) {
        const totalDays = Math.max(
          1,
          Math.round(
            (new Date(alloc.endDate).getTime() -
              new Date(alloc.startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ) + 1,
        );
        const unitsPerDay = alloc.order.totalUnits / totalDays;

        dailyCutMinutes += unitsPerDay * Number(alloc.order.category.samCut);
        dailySewMinutes += unitsPerDay * Number(alloc.order.category.samSew);
        dailyFinishMinutes +=
          unitsPerDay * Number(alloc.order.category.samFinish);
        dailyPackMinutes += unitsPerDay * Number(alloc.order.category.samPack);
      }
    });

    // Compute maximum available minutes for the line's specific manpower sizes (8-hour shift)
    const maxCutAvail = targetLine.manpowerCut * 8 * 60;
    const maxSewAvail = targetLine.manpowerSew * 8 * 60;
    const maxFinishAvail = targetLine.manpowerFinish * 8 * 60;
    const maxPackAvail = targetLine.manpowerPack * 8 * 60;

    // Evaluate utilization percentages
    const cutUtil = maxCutAvail > 0 ? (dailyCutMinutes / maxCutAvail) * 100 : 0;
    const sewUtil = maxSewAvail > 0 ? (dailySewMinutes / maxSewAvail) * 100 : 0;
    const finUtil =
      maxFinishAvail > 0 ? (dailyFinishMinutes / maxFinishAvail) * 100 : 0;
    const packUtil =
      maxPackAvail > 0 ? (dailyPackMinutes / maxPackAvail) * 100 : 0;

    // Check if any metric breaches maximum floor limits (>100%)
    if (cutUtil > 100 || sewUtil > 100 || finUtil > 100 || packUtil > 100) {
      const maxViolation = Math.max(cutUtil, sewUtil, finUtil, packUtil);

      let departmentInFault = "Sewing";
      if (cutUtil === maxViolation) departmentInFault = "Cutting";
      if (finUtil === maxViolation) departmentInFault = "Finishing";
      if (packUtil === maxViolation) departmentInFault = "Packing";

      return {
        isSafe: false,
        offendingDate: currentDayStr,
        offendingDepartment: departmentInFault,
        peakUtilization: Math.round(maxViolation),
        message: `⚠️ Capacity Rejection: On ${currentDayStr}, the [${departmentInFault}] department on ${targetLine.name} would hit ${Math.round(maxViolation)}% utilization.\n\nPlease allocate this order to a different line or adjust your timelines.`,
      };
    }
  }

  return { isSafe: true, message: "Timeline validation passed successfully." };
}
