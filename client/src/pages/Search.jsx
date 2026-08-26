import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "../api/axios";
import TaskItem from "../components/TaskItem";
import NewTaskModal from "../components/NewTaskModal";
import { useToast } from "../components/Toast";

const DEBOUNCE_MS = 400;

export default function Search() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  // Debounce: only update debouncedQuery after the user pauses typing.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks", { params: { search: debouncedQuery } });
      setResults(res.data.data);
    } catch {
      showToast("Couldn't load results", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [debouncedQuery]);

  const toggleTask = async (id) => {
    await api.patch(`/tasks/${id}/toggle`);
    fetchResults();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    showToast("Task deleted");
    fetchResults();
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
      fetchResults();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
  };

  return (
    <div className="max-w-sm mx-auto h-screen bg-white flex flex-col p-4">
      <button
        onClick={() => navigate(-1)}
        className="-ml-2 mb-4 p-2 text-gray-700 hover:bg-gray-100 rounded-full transition w-fit"
      >
        <ArrowLeft size={24} />
      </button>
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a task"
        className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
      />
      <div>
        {loading ? (
          <div className="flex justify-center mt-8 text-gray-400">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : results.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">No tasks found</p>
        ) : (
          results.map((task) => (
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