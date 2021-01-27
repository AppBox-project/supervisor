import { AppBoxData } from "appbox-types";
var shell = require("shelljs");
const uniqid = require("uniqid");

// Install script
export const install = (
  args: { folder: string; key: string; defaultConfig },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Installing backend code from folder ${args.folder}.`);
    await updateTask(`Installing backend (${args.folder}).`);
    // Step 1: copy client code from /System/Temp to /AppBox/Files/Apps
    await shell.mkdir("-p", `/AppBox/System/Backends/${args.key}`);

    await shell.cp(
      "-rf",
      `/AppBox/System/Temp/Apps/${args.key}/Backends/${args.folder}/*`,
      `/AppBox/System/Backends/${args.key}`
    );

    // Install
    shell.exec(`yarn --cwd /AppBox/System/Backends/${args.key} install`);

    resolve();
  });

// Update script
export const update = (
  args: { folder: string; key: string; defaultConfig },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Updating backend code from folder ${args.folder}.`);
    await updateTask(`Updating backend (${args.folder}).`);

    // Step 1: copy client code from /System/Temp to /AppBox/Files/Apps
    await shell.cp(
      "-rf",
      `/AppBox/System/Temp/Apps/${args.key}/Backends/${args.folder}/*`,
      `/AppBox/System/Backends/${args.key}`
    );

    // Install
    shell.exec(`yarn --cwd /AppBox/System/Backends/${args.key} install`);

    resolve();
  });

// Uninstall script
export const uninstall = (
  args: { folder: string; key: string; defaultConfig },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Uninstalling backend code from folder ${args.folder}.`);
    await updateTask(`Uninstalling backend (${args.folder}).`);
    // Step 1: copy client code from /System/Temp to /AppBox/Files/Apps
    await shell.exec(`rm -rf /AppBox/System/Backends/${args.key}`);

    // Todo: clean up settings and everything
    resolve();
  });
