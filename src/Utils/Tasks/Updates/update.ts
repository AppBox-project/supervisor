import { find, map } from "lodash";
import { ModelType } from "appbox-types";

const YAML = require("yaml");
var shell = require("shelljs");
const fs = require("fs");

export default async (task, models) => {
  console.log("Starting update process");
  let updateApplied = false;

  // Step 1: Client
  let result = await shell.exec("git -C /AppBox/System/Client pull");
  // Todo: does language matter here?
  if (!result.match("up to date")) {
    updateApplied = true;
    console.log("Client update found. Installing and recompiling.");
    task.data.state = "Updates found. Installing and recompiling client.";
    task.data.progress = 10;
    task.data.done = false;
    task.markModified("data");
    await task.save();

    await shell.exec(
      "yarn --cwd ../Client install && yarn --cwd ../Client build"
    );
  }

  // Step 2: Server
  task.data.state = "Looking for Server updates";
  task.data.progress = 25;
  task.markModified("data");
  await task.save();

  result = await shell.exec("git -C /AppBox/System/Server pull");
  if (!result.match("up to date")) {
    updateApplied = true;
    task.data.state = "Server: Installing dependencies";
    task.data.progress = 30;
    task.markModified("data");
    await task.save();
    result = await shell.exec("yarn --cwd ../Server install");

    // Compare systemDataversion
    // If system data has updated, reflect those changes here
    task.data.state = "Server: Comparing system data";
    task.data.progress = 40;
    task.markModified("data");
    await task.save();

    const sdv = await models.systemsettings.model.findOne({
      key: "systemDataVersion",
    });
    const modelData = YAML.parse(
      fs.readFileSync("/AppBox/System/Server/src/Data/Models.yml", "utf8")
    );

    const objectData = YAML.parse(
      fs.readFileSync("/AppBox/System/Server/src/Data/Objects.yml", "utf8")
    );

    if (sdv.value !== modelData.systemDataVersion) {
      task.data.state = "New system data found! Updating.";
      console.log("New system data found! Updating.");
      task.data.progress = 45;
      task.markModified("data");
      await task.save();

      // Models
      const currentModels: ModelType[] = await models.models.model.find({});
      const modelsToUpdate = [];
      const modelsToCreate = [];
      modelData.models.map((newModel: ModelType) => {
        const oldModel: ModelType = find(
          currentModels,
          (o) => o.key === newModel.key
        );

        if (oldModel) {
          // Update
          let modelHasChanged = false;

          // Compare fields
          map(newModel.fields, (newField, fieldKey) => {
            if (!oldModel.fields[fieldKey]) {
              console.log(`New field: ${newModel.name} / ${fieldKey}`);
              modelHasChanged = true;
              oldModel.fields[fieldKey] = newModel.fields[fieldKey];
              oldModel.markModified("fields");
            }
          });

          if (modelHasChanged) {
            modelsToUpdate.push(oldModel);
          }
        } else {
          // Insert
          modelsToCreate.push(newModel);
        }
      });

      // Create models
      models.models.model.create(modelsToCreate);

      // Updatemodels
      modelsToUpdate.map(async (newModel) => {
        await newModel.save();
      });

      // Objects (todo)

      // Update systemDataversion
      sdv.value = modelData.systemDataVersion;
      sdv.markModified("value");
      sdv.save();
    }
  }

  // Step 3: Engine
  task.data.state = "Looking for Engine updates";
  task.data.progress = 50;
  task.markModified("data");
  await task.save();

  result = await shell.exec("git -C /AppBox/System/Engine pull");
  if (!result.match("up to date")) {
    updateApplied = true;
    task.data.state = "Engine: Installing dependencies";
    task.data.progress = 55;
    task.markModified("data");
    await task.save();
    result = await shell.exec("yarn --cwd ../Engine install");
  }

  // Step 4: App-Server
  task.data.state = "Looking for App-Server updates";
  task.data.progress = 75;
  task.markModified("data");
  await task.save();

  result = await shell.exec("git -C /AppBox/System/App-Server pull");
  if (!result.match("up to date")) {
    updateApplied = true;
    task.data.state = "App-Server: Installing dependencies";
    task.data.progress = 80;
    task.markModified("data");
    await task.save();
    result = await shell.exec("yarn --cwd ../App-Server install");
  }
  result = await shell.exec(
    "git -C /AppBox/System/Supervisor pull  && yarn --cwd /AppBox/System/Supervisor install"
  );

  // Step 5: Supervisor
  task.data.state = "Done";
  task.data.progress = 100;
  task.data.done = true;
  task.data.result = updateApplied ? "update-applied" : "no-update-found";
  task.markModified("data");
  await task.save();
};
