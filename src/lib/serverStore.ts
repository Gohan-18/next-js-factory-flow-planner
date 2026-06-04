// src/lib/serverStore.ts

// Seed initial configurations matching our database types
export const inMemoryCategories = [
  {
    id: 1,
    name: "Hoodie",
    samCut: 2.5,
    samSew: 15.0,
    samFinish: 4.0,
    samPack: 1.5,
  },
  {
    id: 2,
    name: "Basic T-Shirt",
    samCut: 1.0,
    samSew: 6.0,
    samFinish: 2.0,
    samPack: 1.0,
  },
];

export const inMemoryLines = [
  {
    id: 101,
    name: "Line A (High Capacity)",
    manpowerCut: 5,
    manpowerSew: 25,
    manpowerFinish: 8,
    manpowerPack: 4,
  },
  {
    id: 102,
    name: "Line B (Flexible Assembly)",
    manpowerCut: 2,
    manpowerSew: 12,
    manpowerFinish: 4,
    manpowerPack: 2,
  },
];

// Active mock allocations database array state
export const inMemoryAllocations = [
  {
    id: "mock-uuid-1",
    styleName: "Initial Pilot Run Hoodie",
    categoryId: 1,
    totalUnits: 1200,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    lineId: 101,
  },
];
