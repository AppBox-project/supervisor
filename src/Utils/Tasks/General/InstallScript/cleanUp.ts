import { AppBoxData } from "appbox-types";
var shell = require("shelljs");

// Install script
export const install = (
  args: { key: string },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Cleaning up.`);
    //await updateTask("Cleaning up...");
    //await shell.rm(`-rf`, `/AppBox/System/Temp/${args.key}`);
    resolve();
  });

// Update script
export const update = (
  args: { key: string },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Cleaning up.`);
    //await updateTask("Cleaning up...");
    //await shell.rm(`-rf`, `/AppBox/System/Temp/${args.key}`);
    resolve();
  });

// Update script
export const uninstall = (
  args: { key: string },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Cleaning up.`);
    //await updateTask("Cleaning up...");
    //await shell.exec(`rm -rf /AppBox/System/Temp/${args.key}`);
    resolve();
  });
