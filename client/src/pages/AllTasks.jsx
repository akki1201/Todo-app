import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import api from "../api/axios";
import TaskItem from "../components/TaskItem";
import NewTaskModal from "../components/NewTaskModal";
import { useToast } from "../components/Toast";

export default function AllTasks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useToast();
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const weekRefs = useRef({});

  const fetchWeeks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks/stats/weeks");
      setWeeks(res.data.data);
    } catch {
      showToast("Couldn't load weeks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeks();
  }, []);

  // Deep-link support: /all-tasks?week=current auto-expands (and scrolls to)
  // the week containing today's date. Used by the Home screen's weekly
  // summary tap so the "click a week's card to expand it" flow is reachable
  // from Home even though Home itself renders a day view per the Figma spec.
  useEffect(() => {
    if (searchParams.get("week") !== "current" || weeks.length === 0) return;

    const today = new Date();
    const idx = weeks.findIndex(
      (w) => today >= new Date(w.weekStart) && today <= new Date(w.weekEnd)
    );

    if (idx !== -1) {
      setExpanded(idx);
      requestAnimationFrame(() => {
        weekRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [weeks, searchParams]);

  const toggleTask = async (id) => {
    await api.patch(`/tasks/${id}/toggle`);
    fetchWeeks();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    showToast("Task deleted");
    fetchWeeks();
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    try {
      await api.put(`/tasks/${editingTask._id}`, form);
      showToast("Task updated");
      setModalOpen(false);
      setEditingTask(null);
      fetchWeeks();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
  };

  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="max-w-sm sm:max-w-md mx-auto min-h-dvh bg-white flex flex-col p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[env(safe-area-inset-bottom)]">
      <button
        onClick={() => navigate(-1)}
        className="-ml-2 mb-4 p-2 text-gray-700 hover:bg-gray-100 rounded-full transition w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-lg font-semibold text-gray-900 mb-4">All Tasks</h1>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center mt-8 text-gray-400">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : weeks.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">No tasks yet</p>
        ) : (
          weeks.map((week, i) => {
            const isOpen = expanded === i;
            return (
              <div
                key={i}
                ref={(el) => (weekRefs.current[i] = el)}
                className={`mb-3 border rounded-2xl overflow-hidden transition-colors ${
                  isOpen ? "border-brand/40" : "border-gray-100"
                }`}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">
                     {fmt(week.weekStart)} – {fmt(week.weekEnd)}
                    </p>
                    <p className="text-xs text-gray-500">
                    {week.completed} completed · {week.pending} open
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-2">
                    {week.tasks.map((task) => (
                      <TaskItem
                        key={task._id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onEdit={openEdit}
                        onView={setViewingTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <NewTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editingTask={editingTask}
      />

      <NewTaskModal
        open={!!viewingTask}
        onClose={() => setViewingTask(null)}
        onSubmit={() => {}}
        editingTask={viewingTask}
        readOnly
      />
    </div>
  );
}