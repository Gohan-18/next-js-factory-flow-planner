// import React from "react";
// import { prisma } from "@/lib/prisma";
// import ScheduleForm from "@/components/ScheduleForm";

// // Force Next.js to fetch fresh database states on visit
// export const dynamic = "force-dynamic";

// export default async function SchedulePage() {
//   // Query baseline definitions securely using our updated Prisma instance
//   const masterCategories = await prisma.category.findMany({
//     select: {
//       id: true,
//       name: true,
//     },
//     orderBy: {
//       name: "asc",
//     },
//   });

//   const masterLines = await prisma.line.findMany({
//     select: {
//       id: true,
//       name: true,
//     },
//     orderBy: {
//       name: "asc",
//     },
//   });

//   return (
//     <main className="p-6">
//       <div className="max-w-6xl mx-auto mb-6">
//         <h1 className="text-2xl font-bold tracking-tight text-gray-900">
//           Order Intake Routing Desk
//         </h1>
//         <p className="text-sm text-gray-500 mt-1">
//           Register new batch styles and allocate timeline workloads across
//           production channels.
//         </p>
//       </div>

//       {/* Render our interactive multi-pane workspace layout component */}
//       <ScheduleForm categories={masterCategories} lines={masterLines} />
//     </main>
//   );
// }

import React from "react";
import ScheduleForm from "@/components/ScheduleForm";

export default function SchedulePage() {
  return (
    <main className="p-6">
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Order Intake Routing Desk
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Register new batch styles and allocate timeline workloads across
          production channels.
        </p>
      </div>

      {/* Render the interactive multi-pane workspace layout component */}
      <ScheduleForm />
    </main>
  );
}
