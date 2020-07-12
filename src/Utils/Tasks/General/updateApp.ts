var shell = require("shelljs");
const axios = require("axios");
var fs = require("fs");
import { map } from "lodash";

export default async (task, models) => {
  console.log(`Starting update task for ${task.data.arguments.appId}`);
  axios
    .get(
      `https://appbox.vicvancooten.nl/api/appbox-app/read/?key=${task.data.arguments.appId}`
    )
    .then(async (response) => {
      const app = response.data[0];
      console.log(`Meta information downloaded for ${app.data.name}.`);

      // Step 1: Clone repo
      task.data.state = "Updating";
      task.data.progress = 10;
      task.markModified("data");
      await task.save();
      shell.exec(
        `git -C /AppBox/System/Client/src/Apps-User/${task.data.arguments.appId} pull`
      );

      // Step 2: Read manifest
      task.data.state = "Parsing manifest";
      task.data.progress = 20;
      task.markModified("data");
      await task.save();
      const manifest = JSON.parse(
        fs.readFileSync(
          `/AppBox/System/Client/src/Apps-User/${task.data.arguments.appId}/manifest.json`,
          "utf8"
        )
      );

      // Step 3: Clone repo
      if (app.data.backend_repository) {
        task.data.state = "Updating backend";
        task.data.progress = 30;
        task.markModified("data");
        await task.save();
        shell.exec(
          `git -C /AppBox/System/Backends/${task.data.arguments.appId} pull`
        );
        shell.exec(
          `yarn --cwd /AppBox/System/Backends/${task.data.arguments.appId} install`
        );
        shell.exec(
          `yarn --cwd /AppBox/System/Backends/${task.data.arguments.appId} build`
        );
      }

      // Step 4: Register as link handler
      if (manifest.handlerFor) {
        map(manifest.handlerFor, async (value, key) => {
          if (typeof key === "string") {
            const model = await models.objects.model.findOne({ key });
            const handlers = model.handlers || {};
            handlers[task.data.arguments.appId] = value;
            model.handlers = handlers;
            model.markModified("handlers");
            model.save();
          }
        });
      }

      // Step 4: Rebuild client
      task.data.state = "Rebuilding client...";
      task.data.progress = 70;
      task.markModified("data");
      await task.save();
      shell.exec("yarn --cwd ../Client build");

      // Done
      task.data.state = "Done";
      task.data.progress = 100;
      task.data.done = true;
      task.markModified("data");
      task.save();
    });
};
