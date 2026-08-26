import { useMemo } from "react";

export default function WeekStrip({ selectedDate, onSelect }) {
  const days = useMemo(() => {
    const arr = [];
    const start = new Date(selectedDate);
    const day = start.getDay(); // 0=Sun..6=Sat
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMonday);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [selectedDate]);

  const dayLabel = (d) => d.toLocaleDateString("en-US", { weekday: "short" });
  const isSameDay = (a, b) => a.toDateString() === b.toDateString();

  return (
    <div className="flex justify-between mt-4">
      {days.map((d, i) => {
        const active = isSameDay(d, selectedDate);
        return (
          <button
            key={i}
            onClick={() => onSelect(d)}
            className={`flex flex-col items-center px-2 py-2 rounded-xl transition ${
              active ? "bg-brand text-white" : "text-gray-500"
            }`}
          >
            <span className="text-[10px]">{dayLabel(d)}</span>
            <span className="text-sm font-semibold">{d.getDate()}</span>
            {active && <span className="w-1 h-1 bg-white rounded-full mt-1" />}
          </button>
        );
      })}
    </div>
  );
}