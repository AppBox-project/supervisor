var shell = require("shelljs");
var fs = require("fs");
import { map, merge } from "lodash";

export default async (task, models) => {
  console.log(`Starting uninstall task for ${task.data.arguments.appId}`);

  if (task.data.arguments.appId.match(/^[a-zA-Z-]*$/)) {
    // Step 1: Read manifest
    task.data.state = "Parsing manifest";
    task.data.progress = 10;
    task.markModified("data");
    await task.save();
    const manifest = JSON.parse(
      await fs.readFileSync(
        `/AppBox/System/Client/src/Apps-User/${task.data.arguments.appId}/manifest.json`,
        "utf8"
      )
    );

    // 1.1 objects
    if (
      manifest.data?.required?.models ||
      (manifest.data?.optional?.models && task.data.arguments.removeData)
    ) {
      console.log("Uninstalling models.");

      const mergedModels = merge(
        manifest.data.required.models,
        manifest.data.optional.models
      ); // Combine the optional and the required model. The seperation only exists for updating. When installing no difference is required.
      const count = Object.keys(mergedModels).length;

      task.data.state = `Removing ${count} ${
        count === 1 ? "model" : "models"
      }.`;
      task.data.progress = 11;
      task.markModified("data");
      await task.save();

      // Loop through the merged model (optional and combined together) and
      map(mergedModels, async (model, modelKey) => {
        await models.models.model.deleteOne({ key: modelKey });
        await models.objects.model.deleteMany({ objectId: modelKey });
      });
    }

    // Todo: remove handlers, remove backend

    // Step 2: remove app
    task.data.state = "Removing code";
    task.data.progress = 20;
    task.markModified("data");
    await task.save();
    shell.exec(
      `rm -rf /AppBox/System/Client/src/Apps-User/${task.data.arguments.appId}`
    );

    // Step 3: Recompile app
    task.data.state = "Recompiling...";
    task.data.progress = 50;
    task.markModified("data");
    await task.save();
    shell.exec("yarn --cwd ../Client build");

    // Step 4: Unregister app
    task.data.state = "Unregistering app";
    task.data.progress = 90;
    task.markModified("data");
    await task.save();
    await models.objects.model.deleteOne({
      objectId: "apps",
      "data.id": task.data.arguments.appId,
    });

    // Done
    task.data.state = "Done";
    task.data.progress = 100;
    task.data.done = true;
    task.markModified("data");
    task.save();
  } else {
    console.log(
      `Security warning: ${task.data.arguments.appId} is not a valid app-id.`
    );
    task.data.state = "Error, check logs.";
    task.data.progress = 99;
    task.markModified("data");
    await task.save();
  }
};
