import { AppBoxData } from "../../../Utils/Types";

export default (
  args: {
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
  new Promise(async (resolve, reject) => {
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
        },
      }).save();
    }
    resolve();
  });
