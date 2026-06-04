````markdown
# Apparel Manufacturing Operational Suite (AMOS)

## Comprehensive Technical Architecture & Engineering Logic Specification

**System Version:** 2.0.0
**Data Adapter Engine:** Prisma Client ^7.8.0 Native Driver Layer
**Database Infrastructure:** Supabase PostgreSQL Managed Cluster (With Dynamic Pool Routing)

---

## 1. Executive Concept & Apparel Shop Floor Mechanics

The Apparel Manufacturing Operational Suite (AMOS) is a full-stack digital twin of an apparel assembly plant. In a traditional factory environment, managing multi-stage manufacturing schedules across distinct production lines is a complex logistics problem. AMOS replaces manual spreadsheets with a programmatic, real-time validation engine.

### 1.1 Structural Unit: The Production Line

A **Production Line** is an independent, self-contained manufacturing channel with its own team of machine operators. Each line handles orders linearly: raw fabric enters at one end, and retail-ready packaged garments exit at the other.

To precisely map shop-floor dynamics, AMOS divides each production line into **four sequential departments**:

1. **✂️ Cutting (Cut):** Laying out and cutting raw fabric bolts into individual garment components (sleeves, torsos, hoods) based on pattern files.
2. **🪡 Sewing (Sew):** The main labor center of the plant floor. Operators assemble cut fabric pieces into finished items. This stage is highly labor-intensive and serves as the main bottleneck for most factory operations.
3. **✨ Finishing (Finish):** Quality assurance inspection, thread trimming, and industrial steam pressing.
4. **📦 Packing (Pack):** Final folding, retail tagging, bagging, and grouping into master shipping cartons.

### 1.2 Time Metric: Standard Allowed Minutes (SAM)

To calculate precise production workloads, AMOS uses an industry-standard engineering metric known as **Standard Allowed Minutes (SAM)**. SAM defines the exact amount of time it should take a single trained operator to complete a specific department task for one garment unit.

Complexity varies significantly by garment category:

- **Basic T-Shirt:** Lower complexity. Requires minimal assembly, resulting in low SAM values (e.g., 6 minutes of total sewing time per piece).
- **Premium Hoodie:** Higher complexity. Features pockets, drawstrings, and a lined hood, resulting in high SAM values (e.g., 15 minutes of total sewing time per piece).

---

## 2. Structural Schema Design & Prisma 7 Configurations

Because Prisma 7 stripped out internal binary executors, the datasource connection strings are managed entirely in `prisma.config.ts`, while `schema.prisma` acts as a clean database structural definition.

### 2.1 Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

model Category {
  id        Int     @id @default(autoincrement())
  name      String  @unique
  samCut    Decimal @map("sam_cut")
  samSew    Decimal @map("sam_sew")
  samFinish Decimal @map("sam_finish")
  samPack   Decimal @map("sam_pack")
  orders    Order[]

  @@map("categories")
}

model Line {
  id             Int              @id @default(autoincrement())
  name           String           @unique
  manpowerCut    Int              @map("manpower_cut")
  manpowerSew    Int              @map("manpower_sew")
  manpowerFinish Int              @map("manpower_finish")
  manpowerPack   Int              @map("manpower_pack")
  allocations    LineAllocation[]

  @@map("lines")
}

model Order {
  id            String           @id @default(uuid())
  styleName     String           @map("style_name")
  categoryId    Int              @map("category_id")
  totalUnits    Int              @map("total_units")
  shipDateStart DateTime         @map("ship_date_start")
  shipDateEnd   DateTime         @map("ship_date_end")
  category      Category         @relation(fields: [categoryId], references: [id])
  allocations   LineAllocation[]

  @@map("orders")
}

model LineAllocation {
  id        Int      @id @default(autoincrement())
  orderId   String   @map("order_id")
  lineId    Int      @map("line_id")
  startDate DateTime @map("start_date")
  endDate   DateTime @map("end_date")
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  line      Line     @relation(fields: [lineId], references: [id])

  @@map("line_allocations")
}
```
````

### 2.2 System Configuration (`prisma.config.ts`)

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"), // Port 6543 pooler used at web app runtime
  },
});
```

### 2.3 Shared Database Client (`src/lib/prisma.ts`)

```typescript
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 2.4 End-to-End Workflow Schema

The flow of an order from user intake to dashboard visualization follows a strict data pipeline:

```
[User Form Interface]
        │ (Form Payload)
        ▼
[POST: /api/orders]
        │
        ├──> [Database Fetch] ──> Pulls Line Manpower & Existing Clashing Orders
        │
        ├──> [Capacity Engine] ─> Validates Load Day-by-Day (Must be <= 100%)
        │
        └──> [Prisma Transaction] ── (If Safe) ──> Writes Order & Allocation Tables
                                                       │
                                                       ▼
[Dashboard Heatmap] <── [JSON Matrix] <── [/api/capacity] <── [Supabase Ledger]

```

---

## 3. Mathematical Foundations of the Capacity Engine

The capacity core uses deterministic math to calculate factory load profiles. Instead of treating a timeline as a single generic block, AMOS flattens order targets into daily production increments to evaluate the line's capacity day-by-day.

### 3.1 Step 1: Calculating Maximum Available Minutes

For any targeted calendar date ($d$) and line ($L$), the maximum operational capacity of a specific department ($Dept$) depends entirely on its assigned workforce size. Assuming a standard 8-hour shift, the formula is:

$$\text{CapacityAvailable}_{L, d, Dept} = \text{Manpower}_{L, Dept} \times 8 \times 60 \text{ minutes}$$

### 3.2 Step 2: Calculating Required Minutes (Daily Workload Load)

When an order ($O$) is scheduled across a timeline, AMOS assumes production is spread evenly across all calendar days within that window. The daily unit volume required for an order is:

$$\text{DailyUnits}_{O} = \frac{\text{TotalUnits}_{O}}{\text{EndDate}_{O} - \text{StartDate}_{O} + 1}$$

The minutes required on day ($d$) for a specific department is the sum of the workloads from all overlapping orders currently assigned to that line:

$$\text{WorkloadRequired}_{L, d, Dept} = \sum \left( \text{DailyUnits}_{O} \times \text{SAM}_{Category(O), Dept} \right)$$

### 3.3 Step 3: Calculating Final Utilization Percentage

The engine divides the requested workload by the line's available time to determine its final utilization metric:

$$\text{UtilizationPercentage}_{L, d, Dept} = \left( \frac{\text{WorkloadRequired}_{L, d, Dept}}{\text{CapacityAvailable}_{L, d, Dept}} \right) \times 100$$

---

## 4. Reusable Capacity Validation Core (`src/lib/utils/capacityValidator.ts`)

This isolated module acts as the system's scheduling gatekeeper. It iterates through every calendar day of a proposed order window and verifies that it will not cause any department to cross the 100% capacity limit.

```typescript
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

export function validateLineTimelineCapacity(
  incoming: IncomingPayload,
  targetLine: any,
  targetCategory: any,
  overlappingAllocations: any[],
): ValidationResult {
  const requestedStart = new Date(incoming.startDate);
  const requestedEnd = new Date(incoming.endDate);

  const incomingTotalDays = Math.max(
    1,
    Math.round(
      (requestedEnd.getTime() - requestedStart.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1,
  );
  const incomingUnitsPerDay = incoming.totalUnits / incomingTotalDays;

  const samCut = Number(targetCategory.samCut);
  const samSew = Number(targetCategory.samSew);
  const samFinish = Number(targetCategory.samFinish);
  const samPack = Number(targetCategory.samPack);

  for (
    let d = new Date(requestedStart);
    d <= requestedEnd;
    d.setDate(d.getDate() + 1)
  ) {
    const currentDayStr = d.toISOString().split("T")[0];

    // Initialize daily counters with the proposed order's load
    let dailyCutMinutes = incomingUnitsPerDay * samCut;
    let dailySewMinutes = incomingUnitsPerDay * samSew;
    let dailyFinishMinutes = incomingUnitsPerDay * samFinish;
    let dailyPackMinutes = incomingUnitsPerDay * samPack;

    // Layer on active workloads from orders already booked on this line
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

    // Compute maximum available minutes based on department manpower sizes (8-hour shift)
    const maxCutAvail = targetLine.manpowerCut * 8 * 60;
    const maxSewAvail = targetLine.manpowerSew * 8 * 60;
    const maxFinishAvail = targetLine.manpowerFinish * 8 * 60;
    const maxPackAvail = targetLine.manpowerPack * 8 * 60;

    const cutUtil = maxCutAvail > 0 ? (dailyCutMinutes / maxCutAvail) * 100 : 0;
    const sewUtil = maxSewAvail > 0 ? (dailySewMinutes / maxSewAvail) * 100 : 0;
    const finUtil =
      maxFinishAvail > 0 ? (dailyFinishMinutes / maxFinishAvail) * 100 : 0;
    const packUtil =
      maxPackAvail > 0 ? (dailyPackMinutes / maxPackAvail) * 100 : 0;

    // Intercept and reject immediately if any day breaks the 100% threshold
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
```

---

## 5. API Layer Routing Implementation

### 5.1 Ingestion Gatekeeper API (`src/app/api/orders/route.ts`)

This route invokes our utility engine to check capacity, blocking scheduling entries before any rows are committed to Supabase.

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateLineTimelineCapacity } from "@/lib/utils/capacityValidator";

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

    // Capacity Pre-flight Check Evaluation
    const validation = validateLineTimelineCapacity(
      { startDate, endDate, totalUnits: incomingUnits },
      targetLine,
      targetCategory,
      overlappingAllocations,
    );

    if (!validation.isSafe) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 402 },
      );
    }

    // ACID Compliant Prisma Transaction Write Block
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
    console.error("Database Processing Failure:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Database Processing Error." },
      { status: 500 },
    );
  }
}
```

### 5.2 Capacity Matrix Grid Feed API (`src/app/api/capacity/route.ts`)

This API endpoint feeds the dashboard heatmap by pulling all allocation metrics from Supabase, processing them through our capacity logic, and returning the structured grid layout data to the frontend.

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCapacityMatrix } from "@/lib/capacityEngine"; // Uses the same engine formulas from Section 3

export async function GET() {
  try {
    const [lines, categories, allocations] = await Promise.all([
      prisma.line.findMany(),
      prisma.category.findMany(),
      prisma.lineAllocation.findMany({ include: { order: true } }),
    ]);

    const formattedAllocations = allocations.map((alloc) => ({
      id: alloc.id,
      styleName: alloc.order.styleName,
      categoryId: alloc.order.categoryId,
      totalUnits: alloc.order.totalUnits,
      startDate: alloc.startDate.toISOString().split("T")[0],
      endDate: alloc.endDate.toISOString().split("T")[0],
      lineId: alloc.lineId,
    }));

    const matrixData = computeCapacityMatrix(
      formattedAllocations,
      lines,
      categories,
    );
    return NextResponse.json(matrixData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to compute capacity matrix." },
      { status: 500 },
    );
  }
}
```

---

## 6. Dashboard Heatmap Interpretation Matrix

The metrics generated by the backend are compiled into an interactive dashboard heatmap grid. The frontend UI color-codes these utilization percentages to help shop floor managers easily identify and mitigate production bottlenecks:

| Utilization Range  | Threshold Status   | UI Visual Asset Mapping     | Recommended Operational Action                                                                                                         |
| ------------------ | ------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **0.0% – 84.9%**   | **Available**      | Green Pill Component        | **Optimal Zone.** The production line has remaining capacity and can accept additional orders.                                         |
| **85.0% – 100.0%** | **Warning**        | Amber Pill Component        | **Fully Booked.** The line is performing efficiently. Do not allocate more orders without adding overtime hours.                       |
| **> 100.0%**       | **Over-Allocated** | Pulsing Rose Pill Component | **Critical Bottleneck.** Exceeds standard operator time. Will cause assembly delays. Requires immediate timeline or line reallocation. |

```

```
