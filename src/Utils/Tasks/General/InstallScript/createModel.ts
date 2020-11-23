import { map } from "lodash";
import { ModelType, AppBoxData } from "appbox-types";

// Install
export const install = (
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

// Update:
// --> Now we can't blindly overwrite the model. A user may have modified things. Be careful not to overwrite these things.
export const update = (
  args: { model?: string },
  models: AppBoxData,
  data: { objects: {}; models: {} },
  updateTask: (state: string) => void
) =>
  new Promise(async (resolve, reject) => {
    console.log(`Checking for model updates for ${args.model}.`);
    const oldModel = await models.models.model.findOne({ key: args.model });
    const newModel: ModelType = data.models[args.model];

    // Update various basic properties
    ["name", "name_plural", "app", "icon", "indexed", "primary"].map((p) => {
      if (oldModel[p] !== newModel[p]) {
        console.log(
          `Property ${p} has changed on model ${newModel.name}. Updating (was ${oldModel[p]}, becomes ${newModel[p]})`
        );
        oldModel[p] = newModel[p];
        oldModel.markModified(p);
      }
    });

    // Loop through fields and see what's missing / changed.
    map(newModel.fields, (field, key) => {
      if (!oldModel.fields[key]) {
        console.log(`Model ${newModel.name} has a new field: ${key}`);
        oldModel.fields[key] = newModel.fields[key];
        oldModel.markModified(`fields.${key}`);
      } else {
        // Todo: If a field has changed, gracefully decide what version to apply.
      }
    });

    // Loop through actions and see what's missing / changed.
    map(newModel.actions, (action, key) => {
      if (!oldModel.actions[key]) {
        console.log(`Model ${newModel.name} has a new action: ${key}`);
        oldModel.actions[key] = newModel.actions[key];
        oldModel.markModified(`actions.${key}`);
      } else {
        // Todo: If an action has changed, gracefully decide what version to apply.
      }
    });

    // Loop through layouts and see what's missing / changed.
    map(newModel.layouts, (layouts, key) => {
      if (!oldModel.layouts[key]) {
        console.log(`Model ${newModel.name} has a new layout: ${key}`);
        oldModel.layouts[key] = newModel.layouts[key];
        oldModel.markModified(`layouts.${key}`);
      } else {
        // Todo: If a layout has changed, gracefully decide what version to apply.
      }
    });

    // Loop through handlers and see what's missing / changed.
    map(newModel.handlers, (handler, key) => {
      if (!oldModel.handlers[key]) {
        console.log(`Model ${newModel.name} has a new handler: ${key}`);
        oldModel.handlers[key] = newModel.handlers[key];
        oldModel.markModified(`handlers.${key}`);
      } else {
        // Todo: If a handler has changed, gracefully decide what version to apply.
      }
    });

    // Loop through lists and see what's missing / changed.
    map(newModel.lists, (list, key) => {
      if (!(oldModel.lists || {})[key]) {
        if (!oldModel.lists) oldModel.lists = {};
        console.log(`Model ${newModel.name} has a new list: ${key}`);
        oldModel.lists[key] = newModel.lists[key];
        oldModel.markModified(`lists.${key}`);
      } else {
        // Todo: If a list has changed, gracefully decide what version to apply.
      }
    });

    // Loop through rules and see what's missing / changed.
    map(newModel.rules, (rules, key) => {
      if (!(oldModel.rules || {})[key]) {
        if (!oldModel.rules) oldModel.rules = {};

        console.log(`Model ${newModel.name} has a new rule: ${key}`);
        oldModel.rules[key] = newModel.rules[key];
        oldModel.markModified(`rules.${key}`);
      } else {
        // Todo: If a rule has changed, gracefully decide what version to apply.
      }
    });

    resolve();
  });
