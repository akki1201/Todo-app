require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("./models/Task.model");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Task.updateMany({ status: "Pending" }, { $set: { status: "In Progress" } });
  console.log("migrated");
  process.exit();
});