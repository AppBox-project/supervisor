import { reject } from "lodash";
import { AppBoxData } from "../../../Utils/Types";

export default (
  args: { model?: string },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise(async (resolve, reject) => {
    console.log(`App install script installs model ${args.model}`);
    if (data.models[args.model]) {
      await updateTask(
        `Creating ${data.models[args.model].name_plural} (${args.model})`
      );

      // Step #1: check if model exists
      const existingModel = await models.models.model.findOne({
        key: args.model,
      });
      if (existingModel) {
        console.error(`Model ${args.model} already exists.`);
        resolve();
        return;
      }

      await new models.models.model({
        ...data.models[args.model],
        key: args.model,
      }).save();

      resolve();
    } else {
      console.error(`Model ${args.model} does not exist in install script.`);
      resolve();
    }
  });
