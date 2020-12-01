import { AppBoxData } from "appbox-types";
var shell = require("shelljs");

// Install script
export const install = (
  args: { folder: string; key: string },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Installing client code from folder ${args.folder}.`);
    await updateTask("Installing client.");
    // Step 1: copy client code from /System/Temp to /AppBox/System/Client/Apps-User
    await shell.mkdir(`/AppBox/System/Client/src/Apps-User/${args.key}`);
    await shell.cp(
      "-rf",
      `/AppBox/System/Temp/Apps/${args.key}/Client/${args.folder}/*`,
      `/AppBox/System/Client/src/Apps-User/${args.key}`
    );
    resolve();
  });

// Update script
export const update = (
  args: { folder: string; key: string },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Updating client code from folder ${args.folder}.`);
    await updateTask("Installing client.");
    // Step 1: copy client code from /System/Temp to /AppBox/System/Client/Apps-User
    await shell.mkdir(`/AppBox/System/Client/src/Apps-User/${args.key}`);
    await shell.cp(
      "-rf",
      `/AppBox/System/Temp/Apps/${args.key}/Client/${args.folder}/*`,
      `/AppBox/System/Client/src/Apps-User/${args.key}`
    );
    resolve();
  });

// Uninstall script
export const uninstall = (
  args: { folder: string; key: string },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Uninstalling client code from folder ${args.folder}.`);
    await updateTask("Uninstalling client.");
    // Step 1: copy client code from /System/Temp to /AppBox/System/Client/Apps-User
    await shell.exec(`rm -rf /AppBox/System/Client/src/Apps-User/${args.key}`);
    resolve();
  });
