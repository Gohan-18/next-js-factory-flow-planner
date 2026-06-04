// "use client";

// import React, { useState } from "react";
// import Card from "./ui/Card";
// import { createAndScheduleOrder } from "@/app/schedule/actions";

// interface ScheduleFormProps {
//   categories: { id: number; name: string }[];
//   lines: { id: number; name: string }[];
// }

// export default function ScheduleForm({ categories, lines }: ScheduleFormProps) {
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     setLoading(true);
//     setSuccess(false);

//     const formData = new FormData(event.currentTarget);
//     try {
//       await createAndScheduleOrder(formData);
//       setSuccess(true);
//       (event.target as HTMLFormElement).reset();
//     } catch (error) {
//       console.error("Failed to schedule order:", error);
//       alert("Error creating schedule. Verify data entries.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
//     >
//       {/* LEFT COLUMN: Step 2 - Order Input & Category Mapping */}
//       <Card title="Step 2: Order Input & Category Specifications">
//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//               Style Reference Name
//             </label>
//             <input
//               required
//               type="text"
//               name="styleName"
//               placeholder="e.g., Core Winter Hoodie"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//               Apparel Category (SAM Reference)
//             </label>
//             <select
//               required
//               name="categoryId"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select Target Category...</option>
//               {categories.map((cat) => (
//                 <option key={cat.id} value={cat.id}>
//                   {cat.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//               Total Target Volume (Units)
//             </label>
//             <input
//               required
//               type="number"
//               name="totalUnits"
//               min="1"
//               placeholder="e.g., 5000"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                 Ship Window Open
//               </label>
//               <input
//                 required
//                 type="date"
//                 name="shipDateStart"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                 Strict Cancel Date
//               </label>
//               <input
//                 required
//                 type="date"
//                 name="shipDateEnd"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* RIGHT COLUMN: Step 3 - Production Line Assignment & Timeline Setup */}
//       <div className="flex flex-col justify-between space-y-6">
//         <Card title="Step 3: Factory Floor Allocation & Execution Plan">
//           <div className="space-y-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                 Target Manufacturing Line
//               </label>
//               <select
//                 required
//                 name="lineId"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Assign to Production Line...</option>
//                 {lines.map((l) => (
//                   <option key={l.id} value={l.id}>
//                     {l.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                   Production Inception
//                 </label>
//                 <input
//                   required
//                   type="date"
//                   name="startDate"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                   Floor Wrap Up
//                 </label>
//                 <input
//                   required
//                   type="date"
//                   name="endDate"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-xs leading-relaxed">
//               <strong>Capacity Distribution Matrix Note:</strong> This
//               submission instantly evaluates standard allowed minutes across
//               Cut, Sew, Finish, and Pack metrics sequentially during the chosen
//               production timeframe.
//             </div>
//           </div>
//         </Card>

//         {/* Action Controls Footer */}
//         <div className="space-y-3">
//           {success && (
//             <div className="p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg text-sm font-medium text-center">
//               ✔ Order scheduled successfully! Real-time capacity mapping
//               updated.
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {loading
//               ? "Processing Floor Matrix Load..."
//               : "Commit Order to Production Schedule"}
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// }

// "use client";

// import React, { useState } from "react";
// import Card from "./ui/Card";
// import {
//   mockCategories,
//   mockLines,
//   simulateScheduleOrder,
// } from "../lib/mock-api";

// export default function ScheduleForm() {
//   const [loading, setLoading] = useState(false);
//   const [feedback, setFeedback] = useState<{
//     type: "success" | "error" | null;
//     message: string;
//   }>({ type: null, message: "" });

// async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//   event.preventDefault();
//   setLoading(true);
//   setFeedback({ type: null, message: "" });

//   const formData = new FormData(event.currentTarget);

//   const payload = {
//     styleName: formData.get("styleName") as string,
//     categoryId: parseInt(formData.get("categoryId") as string),
//     totalUnits: parseInt(formData.get("totalUnits") as string),
//     shipDateStart: formData.get("shipDateStart") as string,
//     shipDateEnd: formData.get("shipDateEnd") as string,
//     lineId: parseInt(formData.get("lineId") as string),
//     startDate: formData.get("startDate") as string,
//     endDate: formData.get("endDate") as string,
//   };

//   const response = await simulateScheduleOrder(payload);

//   if (response.success) {
//     setFeedback({ type: "success", message: response.message });
//     (event.target as HTMLFormElement).reset(); // Wipe inputs on success
//   } else {
//     setFeedback({ type: "error", message: response.message });
//   }
//   setLoading(false);
// }
// -------------------------------------------------------------

//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     setLoading(true);
//     setFeedback({ type: null, message: "" });

//     const formData = new FormData(event.currentTarget);
//     const payload = {
//       styleName: formData.get("styleName"),
//       categoryId: formData.get("categoryId"),
//       totalUnits: formData.get("totalUnits"),
//       shipDateStart: formData.get("shipDateStart"),
//       shipDateEnd: formData.get("shipDateEnd"),
//       lineId: formData.get("lineId"),
//       startDate: formData.get("startDate"),
//       endDate: formData.get("endDate"),
//     };

//     try {
//       // Point directly to our functional API endpoint route layer
//       const res = await fetch("/api/orders", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setFeedback({ type: "success", message: data.message });
//         (event.target as HTMLFormElement).reset();
//       } else {
//         setFeedback({
//           type: "error",
//           message: data.message || "Validation Failure.",
//         });
//       }
//     } catch (err) {
//       setFeedback({
//         type: "error",
//         message: "Failed to reach network endpoint.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
//     >
//       {/* LEFT COLUMN: Step 2 - Order Input */}
//       <Card title="Step 2: Order Input & Category Specifications">
//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//               Style Reference Name
//             </label>
//             <input
//               required
//               type="text"
//               name="styleName"
//               placeholder="e.g., Core Winter Hoodie"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//               Apparel Category (SAM Reference)
//             </label>
//             <select
//               required
//               name="categoryId"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select Target Category...</option>
//               {mockCategories.map((cat) => (
//                 <option key={cat.id} value={cat.id}>
//                   {cat.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//               Total Target Volume (Units)
//             </label>
//             <input
//               required
//               type="number"
//               name="totalUnits"
//               min="1"
//               placeholder="e.g., 5000"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                 Ship Window Open
//               </label>
//               <input
//                 required
//                 type="date"
//                 name="shipDateStart"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                 Strict Cancel Date
//               </label>
//               <input
//                 required
//                 type="date"
//                 name="shipDateEnd"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* RIGHT COLUMN: Step 3 - Production Line Assignment */}
//       <div className="flex flex-col justify-between space-y-6">
//         <Card title="Step 3: Factory Floor Allocation & Execution Plan">
//           <div className="space-y-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                 Target Manufacturing Line
//               </label>
//               <select
//                 required
//                 name="lineId"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Assign to Production Line...</option>
//                 {mockLines.map((l) => (
//                   <option key={l.id} value={l.id}>
//                     {l.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                   Production Inception
//                 </label>
//                 <input
//                   required
//                   type="date"
//                   name="startDate"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
//                   Floor Wrap Up
//                 </label>
//                 <input
//                   required
//                   type="date"
//                   name="endDate"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-xs leading-relaxed">
//               <strong>Simulated Environment active:</strong> Submitting this
//               layout maps configurations seamlessly using mock validation
//               parameters without communicating with Supabase.
//             </div>
//           </div>
//         </Card>

//         {/* Action Controls & Dynamic Status Alerts Feedback */}
//         <div className="space-y-3">
//           {feedback.type === "success" && (
//             <div className="p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg text-sm font-medium text-center shadow-sm">
//               ✔ {feedback.message}
//             </div>
//           )}

//           {feedback.type === "error" && (
//             <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium text-left shadow-sm whitespace-pre-line">
//               {feedback.message}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <svg
//                   className="animate-spin h-4 w-4 text-white"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   />
//                 </svg>
//                 Calculating Line Load Impact...
//               </>
//             ) : (
//               "Commit Order to Production Schedule"
//             )}
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// }

// src/components/ScheduleForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import Card from "./ui/Card";

interface MetaItem {
  id: number;
  name: string;
}

export default function ScheduleForm() {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{
    categories: MetaItem[];
    lines: MetaItem[];
  }>({ categories: [], lines: [] });
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Pull live lines and categories from Supabase on component load
  useEffect(() => {
    async function loadFormMetadata() {
      try {
        const res = await fetch("/api/meta");
        if (res.ok) {
          const data = await res.json();
          setMeta({ categories: data.categories, lines: data.lines });
        }
      } catch (err) {
        console.error("Failed to load active production configurations", err);
      }
    }
    loadFormMetadata();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback({ type: null, message: "" });

    const formData = new FormData(event.currentTarget);
    const payload = {
      styleName: formData.get("styleName"),
      categoryId: formData.get("categoryId"),
      totalUnits: formData.get("totalUnits"),
      shipDateStart: formData.get("shipDateStart"),
      shipDateEnd: formData.get("shipDateEnd"),
      lineId: formData.get("lineId"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({ type: "success", message: data.message });
        (event.target as HTMLFormElement).reset();
      } else {
        setFeedback({
          type: "error",
          message: data.message || "Validation Failure.",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: "Failed to communicate with production server.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
    >
      {/* LEFT COLUMN: Order Details */}
      <Card title="Order Specifications">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Style Reference Name
            </label>
            <input
              required
              type="text"
              name="styleName"
              placeholder="e.g., Core Winter Hoodie"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Apparel Category
            </label>
            <select
              required
              name="categoryId"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Target Category...</option>
              {meta.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Total Target Volume (Units)
            </label>
            <input
              required
              type="number"
              name="totalUnits"
              min="1"
              placeholder="e.g., 5000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Ship Window Open
              </label>
              <input
                required
                type="date"
                name="shipDateStart"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Strict Cancel Date
              </label>
              <input
                required
                type="date"
                name="shipDateEnd"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* RIGHT COLUMN: Allocation & Submit Controls */}
      <div className="flex flex-col justify-between space-y-6">
        <Card title="Factory Floor Allocation">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Target Manufacturing Line
              </label>
              <select
                required
                name="lineId"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Assign to Production Line...</option>
                {meta.lines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Production Inception
                </label>
                <input
                  required
                  type="date"
                  name="startDate"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Floor Wrap Up
                </label>
                <input
                  required
                  type="date"
                  name="endDate"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Controls & Feedback */}
        <div className="space-y-3">
          {feedback.type === "success" && (
            <div className="p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg text-sm font-medium text-center shadow-sm">
              ✔ {feedback.message}
            </div>
          )}

          {feedback.type === "error" && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium text-left shadow-sm whitespace-pre-line">
              ❌ {feedback.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading
              ? "Committing Order to Supabase Ledger..."
              : "Commit Order to Production Schedule"}
          </button>
        </div>
      </div>
    </form>
  );
}
