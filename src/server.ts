var mongoose = require("mongoose");
import taskFunctions from "./Utils/Tasks";

// Models
require("./Utils/Models/Objects");
require("./Utils/Models/Entries");
require("./Utils/Models/AppPermissions");

mongoose.connect(
  `mongodb://${
    process.env.DBURL ? process.env.DBURL : "192.168.0.2:27017"
  }/AppBox`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function () {
  // Models
  const models = {
    objects: {
      model: mongoose.model("Objects"),
      stream: db.collection("objects").watch(),
      listeners: {},
    },
    entries: {
      model: mongoose.model("Entries"),
      stream: db.collection("entries").watch(),
      listeners: {},
    },
    apppermissions: {
      model: mongoose.model("AppPermissions"),
    },
  };

  // Trigger functions
  const processTasks = (tasks) => {
    tasks.map((task) => {
      if (!task.done) {
        console.log(`Processing task ${task.data.action}`);

        if (task.data.action === "formula-calculate") {
          taskFunctions.formula.calculate(task, models);
        }

        if (task.data.action === "box-update") {
          taskFunctions.updates.update(task, models);
        }
      }
    });
  };
  models.entries.stream.on("change", (change) => {
    models.entries.model.find({ objectId: "system-task" }).then((tasks) => {
      processTasks(tasks);
    });
  });

  models.entries.model.find({ objectId: "system-task" }).then((tasks) => {
    processTasks(tasks);
  });

  console.log("Watching and executing tasks");
});
