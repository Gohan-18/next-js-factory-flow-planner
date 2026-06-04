"use client";

import React, { useEffect, useState } from "react";

interface DepartmentMetrics {
  utilization: number;
  status: "Available" | "Warning" | "Full";
}

interface LineCapacityResult {
  lineName: string;
  overallStatus: "Available" | "Warning" | "Full";
  departments: {
    cut: DepartmentMetrics;
    sew: DepartmentMetrics;
    finish: DepartmentMetrics;
    pack: DepartmentMetrics;
  };
}

interface DayCapacityResult {
  date: string;
  lines: LineCapacityResult[];
}

export default function HeatmapGrid() {
  const [capacityData, setCapacityData] = useState<DayCapacityResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveCapacity() {
      try {
        setError(null);
        const res = await fetch("/api/capacity");
        if (!res.ok) {
          throw new Error(`HTTP Error Status: ${res.status}`);
        }
        const data = await res.json();
        setCapacityData(data);
      } catch (err) {
        console.error("Failed to parse capacity parameters", err);
        setError(
          "Unable to load real-time factory capacity. Please check your database connection.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchLiveCapacity();
  }, []);

  // 1. Loading State Skeleton UI
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-4 max-w-6xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded flex-1"></div>
            <div className="h-8 bg-gray-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Error Fallback State
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
        <span>⚠️</span>
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  // 3. Empty State Handling
  if (capacityData.length === 0) {
    return (
      <div className="max-w-6xl mx-auto text-center p-12 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-sm text-gray-500">
          No layout operational tracks generated across the current schedule
          timeline window.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Active Shop Floor Utilization Matrix
          </h2>
          <p className="text-xs text-gray-500">
            Hover over any production line node block layout to audit internal
            process bottlenecks.
          </p>
        </div>

        {/* Color Legend Badge System */}
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 block"></span>
            <span className="text-gray-600">Available (&lt;85%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 block"></span>
            <span className="text-gray-600">Warning (85% - 100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 block"></span>
            <span className="text-gray-600">Over-Allocated (&gt;100%)</span>
          </div>
        </div>
      </div>

      {/* Main Structural Matrix Grid Table Container */}
      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="px-4 py-3 w-32">Planning Date</th>
              <th className="px-4 py-3">
                Allocations Matrix Breakdown By Production Line Channels
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-mono">
            {capacityData.map((day) => (
              <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    {day.lines.map((line, idx) => {
                      // Map state tokens securely to modern semantic Tailwind color classes
                      const colorMap = {
                        Available:
                          "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100",
                        Warning:
                          "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
                        Full: "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100",
                      };

                      const currentStyle =
                        colorMap[line.overallStatus] ||
                        "bg-gray-50 border-gray-200 text-gray-600";

                      // Rich hover summary info template string to read exact breakdown values
                      const hoverTooltipData = `
${line.lineName} Load Breakdowns:
-----------------------------
✂️ Cutting:   ${line.departments.cut.utilization}% (${line.departments.cut.status})
🪡 Sewing:    ${line.departments.sew.utilization}% (${line.departments.sew.status})
✨ Finishing: ${line.departments.finish.utilization}% (${line.departments.finish.status})
📦 Packing:   ${line.departments.pack.utilization}% (${line.departments.pack.status})
                      `.trim();

                      return (
                        <div
                          key={idx}
                          title={hoverTooltipData}
                          className={`cursor-help select-none px-3 py-1.5 rounded-lg border text-xs font-sans font-medium transition-all duration-150 flex items-center gap-2 ${currentStyle}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              line.overallStatus === "Full"
                                ? "bg-rose-500 animate-pulse"
                                : line.overallStatus === "Warning"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                          />
                          <div>
                            <span className="font-semibold">
                              {line.lineName}
                            </span>
                            <span className="mx-1.5 opacity-40">|</span>
                            <span className="text-[11px] opacity-90 font-mono">
                              Max:{" "}
                              {Math.max(
                                line.departments.cut.utilization,
                                line.departments.sew.utilization,
                                line.departments.finish.utilization,
                                line.departments.pack.utilization,
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
