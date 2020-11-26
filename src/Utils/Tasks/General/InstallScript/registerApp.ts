import { AppBoxData } from "appbox-types";

// Install script
export const install = (
  args: {
    key: string;
    choices;
    info: {
      name: string;
      icon: string;
      color: { r: number; g: number; b: number };
    };
  },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    console.log(`Registering app ${args.key}.`);

    await updateTask("Registering...");
    const oldAppObject = await models.objects.model.findOne({
      objectId: "apps",
      "data.key": args.key,
    });
    if (oldAppObject) {
      console.log("Todo: app already registered");
      resolve();
      return;
    } else {
      await new models.objects.model({
        objectId: "apps",
        data: {
          name: args.info.name,
          icon: args.info.icon,
          color: { ...args.info.color, a: 1 },
          id: args.key,
          choices: args.choices,
        },
      }).save();
    }
    resolve();
  });

// Update script
export const update = (
  args: {
    model?: string;
    key: string;
    info: {
      name: string;
      icon: string;
      color: { r: number; g: number; b: number };
    };
  },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise<void>(async (resolve, reject) => {
    const oldApp = await models.objects.model.findOne({
      objectId: "apps",
      "data.id": args.key,
    });
    let hasChanged = false;
    ["name", "icon", "color"].map((p) => {
      if (oldApp.data[p] !== args.info[p]) {
        oldApp.data[p] = args.info[p];
        oldApp.markModified(`data.${p}`);
        console.log(`(${args.info.name}) Registry: updated ${p}`);
        hasChanged = true;
      }
    });
    if (hasChanged) await oldApp.save();

    resolve();
  });
