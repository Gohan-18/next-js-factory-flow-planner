// src/lib/capacityEngine.ts

export interface DepartmentMetrics {
  utilization: number;
  status: "Available" | "Warning" | "Full";
}

export interface LineCapacityResult {
  lineName: string;
  overallStatus: "Available" | "Warning" | "Full";
  departments: {
    cut: DepartmentMetrics;
    sew: DepartmentMetrics;
    finish: DepartmentMetrics;
    pack: DepartmentMetrics;
  };
}

export interface DayCapacityResult {
  date: string;
  lines: LineCapacityResult[];
}

// Helper calculation utility
function calculateDept(
  unitsPerDay: number,
  sam: number,
  manpower: number,
  hoursPerShift = 8,
): DepartmentMetrics {
  const totalMinutesNeeded = unitsPerDay * sam;
  const totalMinutesAvailable = manpower * hoursPerShift * 60;

  if (totalMinutesAvailable === 0)
    return { utilization: 0, status: "Available" };

  const utilization = Math.round(
    (totalMinutesNeeded / totalMinutesAvailable) * 100,
  );

  let status: "Available" | "Warning" | "Full" = "Available";
  if (utilization > 100) status = "Full";
  else if (utilization >= 85) status = "Warning";

  return { utilization, status };
}

export function computeCapacityMatrix(
  allocations: any[],
  lines: any[],
  categories: any[],
  totalDaysHorizon = 28,
): DayCapacityResult[] {
  const matrix: DayCapacityResult[] = [];
  const today = new Date();

  // Loop through each calendar day in our planning timeline
  for (let i = 0; i < totalDaysHorizon; i++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + i);
    const dateStr = currentDay.toISOString().split("T")[0];

    const dayLineResults: LineCapacityResult[] = lines.map((line) => {
      // Find all orders allocated to this specific line covering the active date loop
      const activeAllocations = allocations.filter((alloc) => {
        const start = new Date(alloc.startDate).toISOString().split("T")[0];
        const end = new Date(alloc.endDate).toISOString().split("T")[0];
        return alloc.lineId === line.id && dateStr >= start && dateStr <= end;
      });

      // Calculate the combined units assigned to this line for today
      let dailyCutUnits = 0,
        dailySewUnits = 0,
        dailyFinishUnits = 0,
        dailyPackUnits = 0;

      activeAllocations.forEach((alloc) => {
        const cat = categories.find((c) => c.id === alloc.categoryId);
        if (!cat) return;

        // Spread units evenly across the order's active dates
        const totalDays = Math.max(
          1,
          Math.round(
            (new Date(alloc.endDate).getTime() -
              new Date(alloc.startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ) + 1,
        );
        const unitsPerDay = alloc.totalUnits / totalDays;

        dailyCutUnits += unitsPerDay;
        dailySewUnits += unitsPerDay;
        dailyFinishUnits += unitsPerDay;
        dailyPackUnits += unitsPerDay;
      });

      // Fetch sample target configs or fall back to default specs
      const categorySample = categories[0] || {
        samCut: 2,
        samSew: 12,
        samFinish: 4,
        samPack: 2,
      };

      // Evaluate metrics across all 4 departments independently
      const cut = calculateDept(
        dailyCutUnits,
        categorySample.samCut,
        line.manpowerCut,
      );
      const sew = calculateDept(
        dailySewUnits,
        categorySample.samSew,
        line.manpowerSew,
      );
      const finish = calculateDept(
        dailyFinishUnits,
        categorySample.samFinish,
        line.manpowerFinish,
      );
      const pack = calculateDept(
        dailyPackUnits,
        categorySample.samPack,
        line.manpowerPack,
      );

      // Determine the overall status based on the highest bottleneck stage
      let overallStatus: "Available" | "Warning" | "Full" = "Available";
      if (
        cut.status === "Full" ||
        sew.status === "Full" ||
        finish.status === "Full" ||
        pack.status === "Full"
      ) {
        overallStatus = "Full";
      } else if (
        cut.status === "Warning" ||
        sew.status === "Warning" ||
        finish.status === "Warning" ||
        pack.status === "Warning"
      ) {
        overallStatus = "Warning";
      }

      return {
        lineName: line.name,
        overallStatus,
        departments: { cut, sew, finish, pack },
      };
    });

    matrix.push({ date: dateStr, lines: dayLineResults });
  }

  return matrix;
}
