const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getWeeklyStats,
  getWeeksSummary,
} = require("../controllers/task.controller");

router.get("/stats/weekly", getWeeklyStats);
router.get("/stats/weeks", getWeeksSummary);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/toggle", toggleTaskStatus);

module.exports = router;