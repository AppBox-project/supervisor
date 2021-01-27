import { map } from "lodash";
const YAML = require("yaml");
const fs = require("fs");
var shell = require("shelljs");
import installScriptFunctions from "./InstallScript/uninstall";

export default async (task, models) => {
  // Vars
  const dir = `/AppBox/System/Temp/Apps/${task.data.arguments.app.data.id}`;
  let result;
  console.log(`Commencing ${task.data.arguments.app.data.name} uninstall.`);

  // Announce that supervisor has started the work.
  await updateTask(task, 5, "Started.");

  if (fs.existsSync(`${dir}/install.yml`)) {
    // Execute installscript
    await updateTask(task, 20, "Undoing install");

    const file = fs.readFileSync(`${dir}/install.yml`, "utf8");
    const installScript = YAML.parse(file);

    let scriptVersion = "script";
    // In case there's multiple versions based on the choices the user made, pick the right script
    if (installScript.versions) {
      installScript.versions.map((version) => {
        let match = true;
        map(version.criteria, (value, key) => {
          if (task.data.arguments.app.data.choices[key] != value) {
            match = false;
          }
        });

        if (match) scriptVersion = version.script;
      });
    }

    // Execute the install script
    const script = installScript[scriptVersion || "script"];

    const data = installScript.data;
    let currentPercentage = 20;

    const stepSize = 80 / (script || []).length;
    await ((script as { action: string }[]) || []).reduce(
      async (prev, step) => {
        await prev;
        let action;
        let args = {
          info: script.info,
          key: task.data.arguments.app.data.id,
          choices: task.data.arguments.app.choices,
          dataAction: task.data.arguments.dataAction,
        };
        if (typeof step === "object") {
          action = step.action;
          args = { ...args, ...step };
        } else {
          action = step;
        }

        if (!installScriptFunctions[action]) {
          console.error(`Uninstall script step ${action} not found.`);
          return false;
        }
        return await installScriptFunctions[action](
          args,
          models,
          data,
          async (state: string) => {
            currentPercentage += stepSize;
            await updateTask(task, currentPercentage, state);
          }
        );
      },
      (script || [])[0]
    );

    // Done following install script
    await updateTask(task, 100, "Uninstall complete!");
  } else {
    task.data.progress = -1;
    task.data.state = "Install script missing";
    task.data.error = true;
    task.markModified("data.state");
    task.markModified("data.error");
    task.markModified("data.progress");
    await task.save();
  }
};

const updateTask = (task, progress: number, state: string) =>
  new Promise<void>(async (resolve) => {
    task.data.progress = progress;
    task.data.state = state;
    task.markModified("data.state");
    task.markModified("data.progress");
    if (progress === 100) {
      task.data.done = true;
      task.markModified("data.done");
    }
    await task.save();
    resolve();
  });
