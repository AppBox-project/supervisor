var mongoose = require("mongoose");
import taskFunctions from "./Utils/Tasks";
import Axios from "axios";

// Models
require("./Utils/Models/Models");
require("./Utils/Models/Objects");
require("./Utils/Models/AppPermissions");
require("./Utils/Models/UserSettings");
require("./Utils/Models/SystemSettings");
require("./Utils/Models/AppSettings");

// Step 1: Launch child processes

// Connect to database and perform tasks.
console.log(
  `Trying to connect to the database at mongodb://${
    process.env.DBURL || "localhost:27017"
  }/AppBox`
);

mongoose.connect(`mongodb://${process.env.DBURL || "localhost:27017"}/AppBox`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
var db = mongoose.connection;
db.once("open", async function () {
  // Models
  const models = {
    models: {
      model: mongoose.model("Models"),
      stream: db.collection("models").watch(),
      listeners: {},
    },
    objects: {
      model: mongoose.model("Objects"),
      stream: db.collection("objects").watch(),
      listeners: {},
    },
    apppermissions: {
      model: mongoose.model("AppPermissions"),
    },
    usersettings: {
      model: mongoose.model("UserSettings"),
    },
    systemsettings: {
      model: mongoose.model("SystemSettings"),
    },
    appsettings: {
      model: mongoose.model("AppSettings"),
    },
  };

  // Trigger functions
  const processTasks = (tasks) => {
    tasks.map((task) => {
      if (
        !task.data.done &&
        (!task.data.progress || task.data.progress === 0)
      ) {
        switch (task.data.action) {
          case "box-update":
            taskFunctions.updates.update(task, models);
            break;
          case "backup":
            taskFunctions.general.backup(task, models);
            break;
          case "app-install":
            if (task.data.progress === 0) {
              taskFunctions.general.installApp(task, models);
            }
            break;
          case "app-uninstall":
            if (task.data.progress === 0) {
              taskFunctions.general.uninstallApp(task, models);
            }
            break;
          case "update-apps":
            if (task.data.progress === 0) {
              taskFunctions.general.updateApps(task, models);
            }
            break;
          case "restart-system":
            if (task.data.progress === 0) {
              taskFunctions.general.restartSystem(task, models);
            }
            break;
          case "restart-supervisor":
            if (task.data.progress === 0) {
              taskFunctions.general.restartSupervisor(task, models);
            }
            break;
          case "restart-server":
            if (task.data.progress === 0) {
              taskFunctions.general.restartServer(task, models);
            }
            break;
          case "restart-engine":
            if (task.data.progress === 0) {
              taskFunctions.general.restartEngine(task, models);
            }
            break;
          default:
            console.log(`Unknown task action ${task.data.action}`);
            break;
        }
      }
    });
  };
  models.objects.stream.on("change", (change) => {
    models.objects.model
      .find({ objectId: "system-tasks", "data.target": "Supervisor" })
      .then((tasks) => {
        processTasks(tasks);
      });
  });

  models.objects.model
    .find({ objectId: "system-tasks", "data.target": "Supervisor" })
    .then((tasks) => {
      processTasks(tasks);
    });

  console.log("Watching and executing tasks");
});
