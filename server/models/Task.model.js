const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      validate: {
        validator: (v) => !/^\d+$/.test(v.trim()),
        message: "Title can't be numbers only",
      },
    },
    description: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (v) => !v || !/^\d+$/.test(v.trim()),
        message: "Description can't be numbers only",
      },
    },
    date: {
      type: Date,
      required: [true, "Task date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
    type: String,
    enum: ["In Progress", "Completed"],
    default: "In Progress",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);