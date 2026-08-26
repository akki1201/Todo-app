const Task = require("../models/Task.model");

function getWeekRange(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

// @desc  Get all tasks (supports ?search=&date=&status=)
// @route GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const { search, date, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single task
// @route GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create task
// @route POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc  Update task
// @route PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc  Delete task
// @route DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Toggle Completed/In Progress
// @route PATCH /api/tasks/:id/toggle
exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    task.status = task.status === "Completed" ? "In Progress" : "Completed";
    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Weekly stats: completed vs pending count + progress % (Mon–Sun, current week)
// @route GET /api/tasks/stats/weekly
exports.getWeeklyStats = async (req, res) => {
  try {
    const { monday, sunday } = getWeekRange(new Date());
    const tasks = await Task.find({ date: { $gte: monday, $lte: sunday } });

    const completed = tasks.filter((t) => t.status === "Completed").length;
    const pending = tasks.filter((t) => t.status === "In Progress").length;
    const total = tasks.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.status(200).json({
      success: true,
      data: { completed, pending, total, progress },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  All weeks summary: open/completed counts + tasks, grouped Mon–Sun,
//        current week pinned first, remaining weeks chronological ascending
// @route GET /api/tasks/stats/weeks
exports.getWeeksSummary = async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ date: 1 });
    const weeks = {}; // key: monday ISO string

    tasks.forEach((t) => {
      const { monday, sunday } = getWeekRange(t.date);
      const key = monday.toISOString();
      if (!weeks[key]) {
        weeks[key] = {
          weekStart: monday,
          weekEnd: sunday,
          completed: 0,
          pending: 0,
          tasks: [],
        };
      }
      weeks[key].tasks.push(t);
      if (t.status === "Completed") weeks[key].completed++;
      else weeks[key].pending++;
    });

    const { monday: currentMonday } = getWeekRange(new Date());
    const currentKey = currentMonday.toISOString();

    // Chronological ascending as the base order...
    const sorted = Object.values(weeks).sort((a, b) => a.weekStart - b.weekStart);

    // ...then pull the current week to the front if it exists in the data.
    const currentIdx = sorted.findIndex(
      (w) => w.weekStart.toISOString() === currentKey
    );

    let result;
    if (currentIdx > -1) {
      const [currentWeek] = sorted.splice(currentIdx, 1);
      result = [currentWeek, ...sorted];
    } else {
      result = sorted;
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};