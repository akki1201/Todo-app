import { useState, useEffect, useRef } from "react";
import { X, Clock } from "lucide-react";

const isOnlyNumbers = (value) => /^\d+$/.test(value.trim());

export default function NewTaskModal({ open, onClose, onSubmit, editingTask, readOnly = false }) {
  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    date: "",
    description: "",
    priority: "Medium",
  });
  const [errors, setErrors] = useState({});

  const startRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || "",
        startTime: editingTask.startTime || "",
        endTime: editingTask.endTime || "",
        date: editingTask.date ? editingTask.date.substring(0, 10) : "",
        description: editingTask.description || "",
        priority: editingTask.priority || "Medium",
      });
    } else {
      setForm({
        title: "",
        startTime: "",
        endTime: "",
        date: "",
        description: "",
        priority: "Medium",
      });
    }
    setErrors({});
  }, [editingTask, open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const next = {};

    if (!form.title.trim()) {
      next.title = "Task title is required";
    } else if (isOnlyNumbers(form.title)) {
      next.title = "Title can't be numbers only";
    }

    if (form.description.trim() && isOnlyNumbers(form.description)) {
      next.description = "Description can't be numbers only";
    }

    if (!form.date) {
      next.date = "Date is required";
    }

    if (!form.startTime) {
      next.startTime = "Start time is required";
    }

    if (!form.endTime) {
      next.endTime = "End time is required";
    } else if (form.startTime && form.endTime <= form.startTime) {
      next.endTime = "End time must be after start time";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (readOnly) return;
    if (!validate()) return;
    onSubmit(form);
  };

  const openPicker = (ref) => {
    if (readOnly || !ref.current) return;
    if (typeof ref.current.showPicker === "function") {
      ref.current.showPicker();
    } else {
      ref.current.focus();
    }
  };

  const priorities = ["Low", "Medium", "High"];
  const priorityColors = {
    Low: "bg-green-100 text-green-700 border-green-300",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    High: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-sm rounded-t-3xl p-5 animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">
            {readOnly ? "Task Details" : editingTask ? "Edit Task" : "Add New Task"}
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <fieldset disabled={readOnly} className={readOnly ? "opacity-70" : ""}>
          <label className="text-xs text-gray-500">Task title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Doing Homework"
            className={`w-full border rounded-lg px-3 py-2 mb-1 text-sm outline-brand ${
              errors.title ? "border-red-400" : ""
            }`}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mb-2">{errors.title}</p>
          )}

          <label className="text-xs text-gray-500 mt-2 block">Set Time</label>
          <div className="flex gap-2 mb-1">
            <div
              onClick={() => openPicker(startRef)}
              className={`flex-1 relative flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer ${
                errors.startTime ? "border-red-400" : ""
              }`}
            >
              <Clock size={16} className="text-gray-400 shrink-0" />
              <span className={form.startTime ? "text-gray-800" : "text-gray-400"}>
                {form.startTime || "Start"}
              </span>
              <input
                ref={startRef}
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="absolute inset-0 opacity-0 pointer-events-none"
              />
            </div>

            <div
              onClick={() => openPicker(endRef)}
              className={`flex-1 relative flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer ${
                errors.endTime ? "border-red-400" : ""
              }`}
            >
              <Clock size={16} className="text-gray-400 shrink-0" />
              <span className={form.endTime ? "text-gray-800" : "text-gray-400"}>
                {form.endTime || "Ends"}
              </span>
              <input
                ref={endRef}
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="absolute inset-0 opacity-0 pointer-events-none"
              />
            </div>
          </div>
          {errors.startTime && (
            <p className="text-xs text-red-500 mb-2">{errors.startTime}</p>
          )}
          {errors.endTime && (
            <p className="text-xs text-red-500 mb-2">{errors.endTime}</p>
          )}

          <label className="text-xs text-gray-500 mt-2 block">Set Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 mb-1 text-sm ${
              errors.date ? "border-red-400" : ""
            }`}
          />
          {errors.date && (
            <p className="text-xs text-red-500 mb-2">{errors.date}</p>
          )}

          <label className="text-xs text-gray-500 mt-2 block">Priority</label>
          <div className="flex gap-2 mb-3 mt-1">
            {priorities.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => !readOnly && setForm({ ...form, priority: p })}
                className={`flex-1 border rounded-lg py-2 text-xs font-medium transition ${
                  form.priority === p
                    ? priorityColors[p]
                    : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <label className="text-xs text-gray-500">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add Description"
            rows={3}
            className={`w-full border rounded-lg px-3 py-2 mb-1 text-sm resize-none ${
              errors.description ? "border-red-400" : ""
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mb-2">{errors.description}</p>
          )}
        </fieldset>

        {!readOnly && (
          <button
            onClick={handleSubmit}
            className="w-full bg-brand text-white rounded-xl py-3 font-medium mt-3"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}