import { useRef, useState } from "react";
import { Trash2, SquarePen, Eye } from "lucide-react";

const SWIPE_THRESHOLD = 60;
const MAX_SWIPE = 80;

export default function TaskItem({ task, onToggle, onDelete, onEdit, onView }) {
  const isDone = task.status === "Completed";
  const [dragX, setDragX] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);

  const priorityDot = {
    Low: "bg-green-500",
    Medium: "bg-yellow-500",
    High: "bg-red-500",
  };

  const handleTouchStart = (e) => {
    dragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!dragging.current) return;
    const delta = e.touches[0].clientX - startX.current;
    const base = revealed ? -MAX_SWIPE : 0;
    let next = base + delta;
    next = Math.max(-MAX_SWIPE, Math.min(0, next));
    setDragX(next);
  };

  const handleTouchEnd = () => {
    dragging.current = false;
    if (dragX <= -SWIPE_THRESHOLD) {
      setDragX(-MAX_SWIPE);
      setRevealed(true);
    } else {
      setDragX(0);
      setRevealed(false);
    }
  };

  const handleDeleteTap = () => {
    setDragX(0);
    setRevealed(false);
    onDelete(task._id);
  };

  return (
    <div className="relative overflow-hidden border-b border-gray-100">
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={handleDeleteTap}
          className="h-full px-5 bg-red-500 text-white flex items-center justify-center text-xs font-medium"
        >
          Delete
        </button>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging.current ? "none" : "transform 0.2s ease",
        }}
        className="relative bg-white flex items-center justify-between py-3"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(task._id)}
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
              isDone ? "bg-brand border-brand" : "border-gray-300"
            }`}
          >
            {isDone && <span className="text-white text-xs">✓</span>}
          </button>

          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              priorityDot[task.priority] || "bg-gray-300"
            }`}
            title={task.priority}
          />

          <span
            className={`text-sm ${
              isDone ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-400 shrink-0">
          {onView && (
            <button onClick={() => onView(task)}>
              <Eye size={16} />
            </button>
          )}
          <button onClick={() => onDelete(task._id)}>
            <Trash2 size={16} />
          </button>
          <button onClick={() => onEdit(task)}>
            <SquarePen size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}