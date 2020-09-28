var shell = require("shelljs");
const axios = require("axios");
var fs = require("fs");
import { map, merge } from "lodash";

export default async (task, models) => {
  console.log(`Starting install task for ${task.data.arguments.appId}`);

  axios
    .get(
      `https://appbox.vicvancooten.nl/api/appbox-app/read/?key=${task.data.arguments.appId}`
    )
    .then(async (response) => {
      const app = response.data[0];
      console.log(`Meta information downloaded for ${app.data.name}.`);

      // Step 1: Clone repo
      task.data.state = "Downloading code";
      task.data.progress = 10;
      task.markModified("data");
      await task.save();
      shell.exec(
        `git -C /AppBox/System/Client/src/Apps-User clone ${app.data.repository} ${task.data.arguments.appId}`
      );

      // Step 2: Read manifest
      task.data.state = "Parsing manifest";
      task.data.progress = 20;
      task.markModified("data");
      await task.save();
      const manifest = JSON.parse(
        await fs.readFileSync(
          `/AppBox/System/Client/src/Apps-User/${task.data.arguments.appId}/manifest.json`,
          "utf8"
        )
      );

      // Step 3: Install all the default information from the manifest.
      // 3.1 Models
      if (manifest.data?.required?.models || manifest.data?.optional?.models) {
        console.log("Models found. Loading data.");
        const mergedModels = merge(
          manifest.data.required.models,
          manifest.data.optional.models
        ); // Combine the optional and the required model. The seperation only exists for updating. When installing no difference is required.
        const count = Object.keys(mergedModels).length;
        task.data.state = `Installing ${count} ${
          count === 1 ? "model" : "models"
        }.`;
        task.data.progress = 22;
        task.markModified("data");
        await task.save();

        // Loop through the merged model (optional and combined together) and
        map(mergedModels, (model, modelKey) => {
          new models.models.model(model).save();
        });
      }

      if (app.data.backend_repository) {
        // Step 3: Clone repo
        task.data.state = "Installing backend";
        task.data.progress = 30;
        task.markModified("data");
        await task.save();
        shell.exec(
          `git -C /AppBox/System/Backends/ clone ${app.data.backend_repository} ${task.data.arguments.appId}`
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
            const model = await models.models.model.findOne({ key });
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

      // Step x: Register app
      task.data.state = "Registering app";
      task.data.progress = 90;
      task.markModified("data");
      await task.save();

      console.log("Install done. Registering new app.");
      const newTask = await models.objects.model.create({
        objectId: "apps",
        data: {
          id: task.data.arguments.appId,
          name: app.data.name,
          color: {
            r: manifest.color.r,
            g: manifest.color.g,
            b: manifest.color.b,
            a: manifest.color.a,
          },
          icon: manifest.icon,
          mobileSettings: manifest.mobileSettings,
        },
      });

      // Done
      task.data.state = "Done";
      task.data.progress = 100;
      task.data.done = true;
      task.markModified("data");
      task.save();
    });
};
