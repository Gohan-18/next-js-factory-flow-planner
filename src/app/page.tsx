// import Image from "next/image";

// export default function Home() {
//   return <div>Hello world</div>;
// }

import React from "react";
import HeatmapGrid from "@/components/HeatmapGrid";

// Generate a clean 4-week calendar horizon starting from today
function generateMock4WeekData() {
  const data = [];
  const today = new Date();

  for (let i = 0; i < 28; i++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + i);
    const dateStr = currentDay.toISOString().split("T")[0];

    // Seed data simulating an active line (Line A) and an available line (Line B)
    data.push({
      date: dateStr,
      lines: [
        {
          lineName: "Line A (High Capacity)",
          overallStatus: i < 7 ? "Full" : i < 14 ? "Warning" : "Available",
          departments: {
            cut: {
              utilization: i < 7 ? 90 : 40,
              status: i < 7 ? "Warning" : "Available",
            },
            sew: {
              utilization: i < 7 ? 120 : i < 14 ? 85 : 55,
              status: i < 7 ? "Full" : i < 14 ? "Warning" : "Available",
            },
            finish: { utilization: i < 7 ? 70 : 30, status: "Available" },
            pack: { utilization: i < 7 ? 65 : 25, status: "Available" },
          },
        },
        {
          lineName: "Line B (Flexible Assembly)",
          overallStatus: "Available",
          departments: {
            cut: { utilization: 15, status: "Available" },
            sew: { utilization: 45, status: "Available" },
            finish: { utilization: 60, status: "Available" },
            pack: {
              utilization: i === 12 ? 95 : 30,
              status: i === 12 ? "Warning" : "Available",
            },
          },
        },
      ],
    });
  }
  return data;
}

export default function DashboardPage() {
  const mockData = generateMock4WeekData();

  return (
    <main className="p-6 max-w-[1600px] mx-auto">
      {/* Header Context Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Factory Floor Capacity Matrix
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rolling 4-week schedule tracking system utilization and operational
            bottlenecks across assembly departments.
          </p>
        </div>

        {/* Color Legend Palette */}
        <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium shadow-sm">
          <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
            Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-green-100 border border-green-300" />
            <span className="text-gray-700">Available (&lt;85%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
            <span className="text-gray-700">Warning (85%-100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-red-100 border border-red-300" />
            <span className="text-gray-700">Full / Bottleneck (&gt;100%)</span>
          </div>
        </div>
      </div>

      {/* Primary Heatmap Execution View */}
      <HeatmapGrid initialData={mockData} />
    </main>
  );
}
