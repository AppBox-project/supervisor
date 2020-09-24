var mongoose = require("mongoose");
import { systemLog } from "./Utils/Functions/common";
import taskFunctions from "./Utils/Tasks";
import Axios from "axios";

// Models
require("./Utils/Models/Objects");
require("./Utils/Models/Entries");
require("./Utils/Models/AppPermissions");
require("./Utils/Models/UserSettings");

// Step 1: Launch child processes

// Connect to database and perform tasks.
Axios.get(`http://${process.env.DBURL || "localhost:27017"}/AppBox`)
  .then((res) => {
    systemLog(`Looking for the database at: ${process.env.DBURL}`);
    mongoose.connect(
      `mongodb://${process.env.DBURL || "localhost:27017"}/AppBox`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    var db = mongoose.connection;
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
        usersettings: {
          model: mongoose.model("UserSettings"),
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
              case "app-update":
                if (task.data.progress === 0) {
                  taskFunctions.general.updateApp(task, models);
                }
                break;
              default:
                systemLog(`Unknown task action ${task.data.action}`);
                break;
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

      systemLog("Watching and executing tasks");
    });
  })
  .catch((err) => {
    systemLog(`Oops. Database is offline.`);
  });
