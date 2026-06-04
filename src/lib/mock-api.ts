// src/lib/mockApi.ts

export const mockCategories = [
  { id: 1, name: "Hoodie (Heavy - 15 min Sew)" },
  { id: 2, name: "Basic T-Shirt (Light - 5 min Sew)" },
  { id: 3, name: "Denim Jacket (Complex - 22 min Sew)" },
];

export const mockLines = [
  { id: 101, name: "Line A (High Capacity Production Line)" },
  { id: 102, name: "Line B (Flexible Short-Run Assembly)" },
];

interface SchedulePayload {
  styleName: string;
  categoryId: number;
  totalUnits: number;
  shipDateStart: string;
  shipDateEnd: string;
  lineId: number;
  startDate: string;
  endDate: string;
}

// Simulates a backend POST request handler
export async function simulateScheduleOrder(
  payload: SchedulePayload,
): Promise<{ success: boolean; message: string }> {
  // Artificial 1-second network handshake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Business Logic Simulation: Fail if production start date is after end date
  if (new Date(payload.startDate) > new Date(payload.endDate)) {
    return {
      success: false,
      message:
        "Scheduling Conflict: Production Inception cannot happen after the Floor Wrap Up date.",
    };
  }

  // Business Logic Simulation: Throw an alert warning if volume is too high for Line B
  if (payload.lineId === 102 && payload.totalUnits > 4000) {
    return {
      success: false,
      message: `⚠️ Capacity Warning: Line B only has 15 sewing operators. Pouring ${payload.totalUnits} units into this timeframe will cause an active bottleneck in the Sewing Department.`,
    };
  }

  return {
    success: true,
    message:
      "Success! Order successfully committed to the production floor calendar layout.",
  };
}
