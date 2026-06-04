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
