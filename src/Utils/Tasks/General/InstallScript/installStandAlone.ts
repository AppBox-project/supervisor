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
    console.log(`Installing standalone code from folder ${args.folder}.`);
    await updateTask(`Installing standalone (${args.folder}).`);
    // Step 1: copy client code from /System/Temp to /AppBox/Files/Apps
    await shell.mkdir("-p", `/AppBox/Files/Apps/${args.key}/${args.folder}`);
    await shell.cp(
      "-rf",
      `/AppBox/System/Temp/Apps/${args.key}/Standalone/${args.folder}/*`,
      `/AppBox/Files/Apps/${args.key}/${args.folder}`
    );

    // Create a unique appId and find other env variables.
    const appId = uniqid();
    const url = await models.systemsettings.model.findOne({
      key: "public_url",
    });
    // Create a .env file
    shell.exec(
      `printf 'REACT_APP_URL=${url.value}\nREACT_APP_NOT_SECRET_CODE=${appId}' >/AppBox/Files/Apps/${args.key}/${args.folder}/.env`
    );
    // Save defaultConfig to the server
    await models.appsettings.model.create({
      key: `standaloneConfig-${appId}`,
      value: args.defaultConfig,
    });

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
    console.log(`Updating client code from folder ${args.folder}.`);
    await updateTask(`Installing standalone (${args.folder}).`);

    // Step 1: copy client code from /System/Temp to /AppBox/System/Client/Apps-User
    await shell.mkdir(`/AppBox/System/Client/src/Apps-User/${args.key}`);
    await shell.cp(
      "-rf",
      `/AppBox/System/Temp/Apps/${args.key}/Client/${args.folder}/*`,
      `/AppBox/System/Client/src/Apps-User/${args.key}`
    );
    resolve();
  });
