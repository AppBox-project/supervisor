var shell = require("shelljs");
const axios = require("axios");
var fs = require("fs");

export default async (task, models) => {
  console.log(`Starting install task for ${task.data.arguments.appId}`);

  axios
    .get(
      `https://appbox.vicvan.co/api/appbox-app/read/?key=${task.data.arguments.appId}`
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
        fs.readFileSync(
          `/AppBox/System/Client/src/Apps-User/${task.data.arguments.appId}/manifest.json`,
          "utf8"
        )
      );

      // More

      // Step x: Register app
      task.data.state = "Registering app";
      task.data.progress = 70;
      task.markModified("data");
      await task.save();
      const newApp = await models.entries.model.create({
        objectId: "app",
        data: {
          id: task.data.arguments.appId,
          name: app.data.name,
          color: manifest.color,
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
