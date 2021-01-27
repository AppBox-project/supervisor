import { map, merge } from "lodash";
const YAML = require("yaml");
const fs = require("fs");
var shell = require("shelljs");
const axios = require("axios");
import installScriptFunctions from "./InstallScript/update";

export default async (oldTask, models) => {
  // Vars
  let result;
  let updatesFound = false;
  console.log("Updating all apps.");
  const task = await models.objects.model.findOne({ _id: oldTask._id });

  // Announce that supervisor has started the work.
  await updateTask(task, 5, "Gettings apps...");
  const apps = await models.objects.model.find({
    objectId: "apps",
    "data.core": { $ne: true },
  });

  // Download
  let currentProgress = 10;
  const progressStep = 90 / apps.length;
  await (apps as any[]).reduce(async (prev, app) => {
    await updateTask(
      task,
      Math.floor(currentProgress),
      `Checking ${app.data.name}`
    );
    console.log(`- Updating ${app.data.name}`);

    // Vars
    const dir = `/AppBox/System/Temp/Apps/${app.data.id}`;
    let result;

    // Download
    result = await shell.exec(
      `git -C /AppBox/System/Temp/Apps clone ${app.data.repository} ${app.data.id}`
    );

    if (result.code === 128) {
      // Folder was alread there.
      await updateTask(
        task,
        Math.floor(currentProgress),
        "Old code found. Checking updates."
      );
      await shell.exec(`git -C ${dir} pull`);
    }

    if (fs.existsSync(`${dir}/install.yml`)) {
      // Execute installscript
      await updateTask(
        task,
        Math.floor(currentProgress + progressStep / 3),
        "Running pre-install scripts"
      );

      const file = fs.readFileSync(`${dir}/install.yml`, "utf8");
      const installScript = YAML.parse(file);

      let scriptVersion = "script";
      // In case there's multiple versions based on the choices the user made, pick the right script
      if (installScript.versions) {
        installScript.versions.map((version) => {
          let match = true;
          map(version.criteria, (value, key) => {
            if (app.data.choices[key] != value) {
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

      const stepSize = progressStep / (script || []).length;
      await ((script as { action: string }[]) || []).reduce(
        async (prev, step) => {
          await prev;
          let action;
          let args = {
            info: script.info,
            key: app.data.id,
            choices: app.data.choices,
          };
          if (typeof step === "object") {
            action = step.action;
            args = { ...args, ...step };
          } else {
            action = step;
          }

          if (!installScriptFunctions[action]) {
            console.error(`Update script step ${action} not found.`);
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
      console.log("Done");

      // Done following install script
      await updateTask(task, 100, "Installation complete!");
    } else {
      task.data.progress = -1;
      task.data.state = "Install script missing";
      task.data.error = true;
      task.markModified("data.state");
      task.markModified("data.error");
      task.markModified("data.progress");
      await task.save();
    }
    currentProgress += progressStep;
  }, apps[0]);

  await updateTask(task, 80, "Compiling... Grab a cup ☕");
  await shell.exec("yarn buildClient");
  await updateTask(task, 100, "Updates complete!");
};

const updateTask = (task, progress: number, state: string) =>
  new Promise<void>(async (resolve) => {
    task.data.progress = Math.floor(progress);
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
