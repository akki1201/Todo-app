const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Task = require("./models/Task.model");

dotenv.config();

const sampleTasks = [
  {
    title: "Finishing Wireframe",
    description: "Complete the app wireframe in Figma",
    date: new Date(),
    startTime: "09:00",
    endTime: "11:00",
    priority: "High",
    status: "In Progress",
  },
  {
    title: "Meeting with team",
    description: "Weekly sync on project progress",
    date: new Date(),
    startTime: "12:00",
    endTime: "13:00",
    priority: "Medium",
    status: "In Progress",
  },
  {
    title: "Buy a cat food",
    description: "Get the usual brand from the store",
    date: new Date(),
    startTime: "17:00",
    endTime: "17:30",
    priority: "Low",
    status: "Completed",
  },
  {
    title: "Finishing daily commission",
    description: "Wrap up freelance design work",
    date: new Date(),
    startTime: "19:00",
    endTime: "20:00",
    priority: "Medium",
    status: "Completed",
  },
  {
    title: "Doing Homework",
    description: "Math and science assignment",
    date: new Date(Date.now() + 86400000), // tomorrow
    startTime: "16:00",
    endTime: "18:00",
    priority: "High",
    status: "In Progress",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Task.deleteMany({});
    console.log("Old tasks cleared");

    await Task.insertMany(sampleTasks);
    console.log("Sample tasks inserted");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();