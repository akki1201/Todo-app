import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, Plus, Settings, Bell, Loader2, ChevronRight } from "lucide-react";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import WeekStrip from "../components/WeekStrip";
import TaskItem from "../components/TaskItem";
import NewTaskModal from "../components/NewTaskModal";
import { useToast } from "../components/Toast";

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

const sortByPriority = (list) =>
  [...list].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
  );

export default function Home() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ completed: 0, pending: 0, progress: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const dateStr = selectedDate.toISOString().substring(0, 10);
      const res = await api.get("/tasks", { params: { date: dateStr } });
      setTasks(res.data.data);
    } catch {
      showToast("Couldn't load tasks", "error");
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/tasks/stats/weekly");
      setStats(res.data.data);
    } catch {
      // silent — stats are non-critical
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  useEffect(() => {
    fetchStats();
  }, [tasks]);

  const toggleTask = async (id) => {
    try {
      await api.patch(`/tasks/${id}/toggle`);
      fetchTasks();
    } catch {
      showToast("Couldn't update task", "error");
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      showToast("Task deleted");
      fetchTasks();
    } catch {
      showToast("Couldn't delete task", "error");
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, form);
        showToast("Task updated");
      } else {
        await api.post("/tasks", form);
        showToast("Task created");
      }
      setModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
  };

  const goToWeeklyView = () => navigate("/all-tasks?week=current");

  const visibleTasks = sortByPriority(tasks);

  return (
    <div className="max-w-sm sm:max-w-md mx-auto min-h-dvh bg-white flex flex-col p-4 relative pt-[calc(env(safe-area-inset-top)+1rem)]">
      {modalOpen ? (
        <div className="flex items-center justify-between mb-3">
          <button className="text-gray-500 p-2 -m-2">
            <Settings size={22} />
          </button>
          <div className="flex items-center gap-4 text-gray-500">
            <SearchIcon size={20} />
            <Bell size={20} />
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/search")}
          className="w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-gray-400 mb-2 mt-1"
        >
          Search for a task
          <SearchIcon size={16} />
        </button>
      )}

      <WeekStrip selectedDate={selectedDate} onSelect={setSelectedDate} />

      {/* Tappable weekly summary -> jumps to All Tasks with the current week expanded.
          Satisfies "clicking a week's card expands to show its tasks" straight from Home. */}
      <div
        role="button"
        tabIndex={0}
        onClick={goToWeeklyView}
        onKeyDown={(e) => e.key === "Enter" && goToWeeklyView()}
        className="mt-5 -mx-1 px-1 py-1 rounded-2xl cursor-pointer active:bg-gray-50 transition"
        aria-label="View this week's full task breakdown"
      >
        <div className="flex gap-3">
          <StatCard type="complete" count={stats.completed} label="This Week" />
          <StatCard type="pending" count={stats.pending} label="This Week" />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">Weekly Progress</p>
            
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-5 mb-1">
        <p className="font-semibold text-gray-800">Tasks Today</p>
        <button
          onClick={() => navigate("/all-tasks")}
          className="text-brand text-sm p-2 -m-2"
        >
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-16">
        {loadingTasks ? (
          <div className="flex justify-center mt-8 text-gray-400">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : visibleTasks.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-6">No tasks for this day</p>
        ) : (
          visibleTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={openEdit}
              onView={setViewingTask}
            />
          ))
        )}
      </div>

      <button
        onClick={() => {
          setEditingTask(null);
          setModalOpen(true);
        }}
        aria-label="Add Task"
        className="absolute left-1/2 -translate-x-1/2 w-14 h-14 bg-brand rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
      >
        <Plus />
      </button>

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