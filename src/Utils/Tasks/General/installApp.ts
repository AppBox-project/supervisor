import { map, merge } from "lodash";
const YAML = require("yaml");
const fs = require("fs");
var shell = require("shelljs");
const axios = require("axios");
import installScriptFunctions from "./InstallScript";

export default async (oldTask, models) => {
  // Vars
  const dir = `/AppBox/System/Client/src/Apps-User/${oldTask.data.arguments.app.data.key}`;
  let result;
  console.log(
    `Starting install task for`,
    oldTask.data.arguments.app.data.name
  );
  const task = await models.objects.model.findOne({ _id: oldTask._id });

  // Announce that supervisor has started the work.
  await updateTask(task, 5, "Downloading");

  // Download
  result = await shell.exec(
    `git -C /AppBox/System/Client/src/Apps-User clone ${oldTask.data.arguments.app.data.repository} ${oldTask.data.arguments.app.data.key}`
  );

  if (result.code === 128) {
    // Folder was alread there.
    await updateTask(task, 8, "Old code found. Checking updates.");
    await shell.exec(`git -C /AppBox/System/Client/src/Apps-User pull`);
  }

  if (fs.existsSync(`${dir}/install.yml`)) {
    // Execute installscript
    await updateTask(task, 20, "Running pre-install");

    const file = fs.readFileSync(`${dir}/install.yml`, "utf8");
    const installScript = YAML.parse(file);

    let scriptVersion = "script";
    // In case there's multiple versions based on the choices the user made, pick the right script
    if (installScript.versions) {
      installScript.versions.map((version) => {
        let match = true;
        map(version.criteria, (value, key) => {
          if (oldTask.data.arguments.choices[key] != value) {
            match = false;
          }
        });

        if (match) scriptVersion = version.script;
      });
    }

    // Execute the install script
    const script = installScript[scriptVersion];
    const data = installScript.data;
    let currentPercentage = 20;
    const stepSize = 20 / script.steps.length;
    await (script.steps as { action: string }[]).reduce(async (prev, step) => {
      await prev;
      let action;
      let args = {
        info: script.info,
        key: oldTask.data.arguments.app.data.key,
      };
      if (typeof step === "object") {
        action = step.action;
        args = { ...args, ...step };
      } else {
        action = step;
      }

      return await installScriptFunctions[action](
        args,
        models,
        data,
        (state: string) => {
          currentPercentage += stepSize;
          updateTask(task, currentPercentage, state);
        }
      );
    }, script.steps[0]);

    // Done following install script. Recompile client.
    await updateTask(task, 60, "Compiling... Grab a cup ☕");
    await shell.exec("yarn buildClient");
    await updateTask(task, 100, "Installation complete!");
  } else {
    updateTask(task, 0, "Error: install script missing from app.");
  }
};

const updateTask = (task, progress: number, state: string) =>
  new Promise(async (resolve) => {
    task.data.progress = progress;
    task.data.state = state;
    task.markModified("data.state");
    task.markModified("data.progress");
    await task.save();
    resolve();
  });
