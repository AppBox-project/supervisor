import { AppBoxData } from "appbox-types";
var shell = require("shelljs");

// Install script
export const install = (
  args: {},
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise(async (resolve, reject) => {
    console.log(`Compiling.`);
    await updateTask("Compiling... Grab a cup. ☕");
    await shell.exec(`yarn buildClient`);
    resolve();
  });

// Update script
export const update = (
  args: { folder: string; key: string },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise(async (resolve, reject) => {
    await updateTask("Compiling... Grab a cup. ☕");
    await shell.exec(`yarn buildClient`);
    resolve();
  });
