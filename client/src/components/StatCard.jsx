export default function StatCard({ type, count, label }) {
  const isComplete = type === "complete";
  return (
    <div
      className={`flex-1 rounded-2xl p-4 ${
        isComplete ? "bg-brand/10" : "bg-red-50"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center ${
            isComplete ? "bg-brand" : "bg-red-400"
          }`}
        >
          <span className="text-white text-xs font-bold">
            {isComplete ? "✓" : "✕"}
          </span>
        </div>
        <span className="text-sm text-gray-700 font-medium">
          {isComplete ? "Task Complete" : "Task Pending"}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {count} <span className="text-xs font-normal text-gray-500">{label}</span>
      </p>
    </div>
  );
}