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

    result = await shell.exec(
      `git -C /AppBox/System/Client/src/Apps-User/${app.data.id} pull`
    );
    if (!result.match("Already up to date") || true) {
      // Todo: code 0 counts as success, this string can be translated on different servers
      updatesFound = true;
      const dir = `/AppBox/System/Client/src/Apps-User/${app.data.id}`;

      if (fs.existsSync(`${dir}/install.yml`)) {
        const file = fs.readFileSync(`${dir}/install.yml`, "utf8");
        const installScript = YAML.parse(file);

        // Get install script version
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

        // Run pre-install
        await updateTask(
          task,
          currentProgress + progressStep / 3,
          `(${app.data.name}) Running pre-install scripts`
        );
        const script = installScript[scriptVersion];
        const data = installScript.data;
        await (script.steps as { action: string }[]).reduce(
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
              console.error(`Install script step ${action} not found.`);
              return false;
            }
            return await installScriptFunctions[action](
              args,
              models,
              data,
              async (state: string) => {
                await updateTask(
                  task,
                  currentProgress + progressStep / 3,
                  state
                );
              }
            );
          },
          script.steps[0]
        );

        // Run post-install (compilation happens later, the difference is now irrelevant)
        // Run pre-install
        await updateTask(
          task,
          currentProgress + (progressStep / 3) * 2,
          `(${app.data.name}) Running post-install scripts`
        );
        await (script["post-install"] as { action: string }[]).reduce(
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
              console.error(`Install script step ${action} not found.`);
              return false;
            }
            return await installScriptFunctions[action](
              args,
              models,
              data,
              async (state: string) => {
                await updateTask(
                  task,
                  currentProgress + progressStep / 3,
                  state
                );
              }
            );
          },
          script.steps[0]
        );

        return true;
      } else {
        console.error(`App ${app.data.id} does not have an install.yml.`);
      }
    }
    currentProgress += progressStep;
  }, apps[0]);

  await updateTask(task, 80, "Compiling... Grab a cup ☕");
  await shell.exec("yarn buildClient");
  await updateTask(task, 100, "Updates complete!");
};

const updateTask = (task, progress: number, state: string) =>
  new Promise(async (resolve) => {
    task.data.progress = Math.floor(progress);
    task.data.state = state;
    task.markModified("data.state");
    task.markModified("data.progress");
    await task.save();
    resolve();
  });
