import { AppBoxData } from "appbox-types";
import { findIndex, forEach, map } from "lodash";

// This function registers data inside default objects.
export const install = (
  args: {
    values: {
      people?: {
        types: string[];
        fields;
        overviews: { [key: string]: {} };
        lists: { [key: string]: {} };
        layouts: { [key: string]: {} };
        dropdown_options: { [key: string]: { label; key }[] };
      };
    };
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
    console.log(`Adding system values`);

    map(args?.values || {}, async (values, modelKey) => {
      console.log(`Adding ${modelKey} values`);
      const originalModel = await models.models.model.findOne({
        key: modelKey,
      });
      let modelHasChanged = false;

      // Fields
      map(values?.fields || {}, (field, fieldKey) => {
        if (!originalModel.fields) originalModel.fields = {};
        if (!originalModel.fields[fieldKey]) {
          console.log(`Adding ${modelKey} field ${fieldKey}.`);
          originalModel.fields[fieldKey] = field;
          originalModel.markModified("fields");
          modelHasChanged = true;
        }
      });

      // Overviews
      map(values?.overviews || {}, (overview, overviewKey) => {
        if (!originalModel.overviews) originalModel.overviews = {};
        if (!originalModel.overviews[overviewKey]) {
          console.log(`Adding ${modelKey} overview ${overviewKey}.`);
          originalModel.overviews[overviewKey] = overview;
          originalModel.markModified("overviews");
          modelHasChanged = true;
        }
      });

      // Layouts
      map(values?.layouts || {}, (layout, layoutKey) => {
        if (!originalModel.layouts) originalModel.layouts = {};
        if (!originalModel.layouts[layoutKey]) {
          console.log(`Adding ${modelKey} layout ${layoutKey}.`);
          originalModel.layouts[layoutKey] = layout;
          originalModel.markModified("layouts");
          modelHasChanged = true;
        }
      });

      // Lists
      map(values?.lists || {}, (list, listKey) => {
        if (!originalModel.lists) originalModel.lists = {};
        if (!originalModel.lists[listKey]) {
          console.log(`Adding ${modelKey} list ${listKey}.`);
          originalModel.lists[listKey] = list;
          originalModel.markModified("lists");
          modelHasChanged = true;
        }
      });

      // Add local options
      map(values?.dropdown_options || {}, (options, optionsKey) => {
        // Loop through options
        options.map((newOption) => {
          let newOptionAlreadyExists = false;
          originalModel.fields[optionsKey].typeArgs.options.map((oldOption) => {
            if (oldOption.key === newOption.key) newOptionAlreadyExists = true;
          });

          // If it doesn't exist, add it
          if (!newOptionAlreadyExists) {
            console.log(
              `Adding option for ${modelKey}-${optionsKey}: ${newOption.key}`
            );
            originalModel.fields[optionsKey].typeArgs.options.push(newOption);
            originalModel.markModified(`fields.${optionsKey}.typeArgs.options`);
            modelHasChanged = true;
          }
        });
      });

      if (modelHasChanged) {
        await originalModel.save();
      }
    });

    resolve();
  });

export const update = (
  args: {
    values: {
      people?: {
        types: {
          label: string;
          key: string;
          withList?: boolean;
          listName?: string;
        }[];
        overviews: { [key: string]: {} };
        layouts: { [key: string]: {} };
        lists: { [key: string]: {} };
        dropdown_options: { [key: string]: { label; key }[] };
        fields: {
          [key: string]: { name; type; typeArgs: { type; formula } };
        };
      };
    };
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
    console.log(`Updating system values`);

    map(args?.values || {}, async (values, modelKey) => {
      console.log(`Updating ${modelKey} values`);
      const originalModel = await models.models.model.findOne({
        key: modelKey,
      });
      let modelHasChanged = false;

      // Fields
      map(values?.fields || {}, (field, fieldKey) => {
        if (!originalModel.fields[fieldKey]) {
          console.log(`Adding ${modelKey} field ${fieldKey}.`);
          originalModel.fields[fieldKey] = field;
          originalModel.markModified("fields");
          modelHasChanged = true;
        }
      });

      // Overviews
      map(values?.overviews || {}, (overview, overviewKey) => {
        if (!originalModel.overviews[overviewKey]) {
          console.log(`Adding ${modelKey} overview ${overviewKey}.`);
          originalModel.overviews[overviewKey] = overview;
          originalModel.markModified("overviews");
          modelHasChanged = true;
        }
      });

      // Layouts
      map(values?.layouts || {}, (layout, layoutKey) => {
        if (!originalModel.layouts[layoutKey]) {
          console.log(`Adding ${modelKey} layout ${layoutKey}.`);
          originalModel.layouts[layoutKey] = layout;
          originalModel.markModified("layouts");
          modelHasChanged = true;
        }
      });

      // Lists
      map(values?.lists || {}, (list, listKey) => {
        if (!originalModel.lists[listKey]) {
          console.log(`Adding ${modelKey} list ${listKey}.`);
          originalModel.lists[listKey] = list;
          originalModel.markModified("lists");
          modelHasChanged = true;
        }
      });

      // Add local options
      map(values?.dropdown_options || {}, (options, optionsKey) => {
        // Loop through options
        options.map((newOption) => {
          let newOptionAlreadyExists = false;
          originalModel.fields[optionsKey].typeArgs.options.map((oldOption) => {
            if (oldOption.key === newOption.key) newOptionAlreadyExists = true;
          });

          // If it doesn't exist, add it
          if (!newOptionAlreadyExists) {
            console.log(
              `Adding option for ${modelKey}-${optionsKey}: ${newOption.key}`
            );
            originalModel.fields[optionsKey].typeArgs.options.push(newOption);
            originalModel.markModified(`fields.${optionsKey}.typeArgs.options`);
            modelHasChanged = true;
          }
        });
      });

      if (modelHasChanged) {
        await originalModel.save();
      }
    });

    resolve();
  });

// Uninstall
export const uninstall = (
  args: {
    values: {
      people?: {
        overviews: { [key: string]: {} };
        layouts: { [key: string]: {} };
        lists: { [key: string]: {} };
        dropdown_options: { [key: string]: { label; key }[] };

        fields: {
          [key: string]: { name; type; typeArgs: { type; formula } };
        };
      };
    };
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
    console.log(`Deleting values that app registered in system`);

    map(args?.values || {}, async (values, modelKey) => {
      console.log(`Deleting ${modelKey} values`);
      const originalModel = await models.models.model.findOne({
        key: modelKey,
      });
      let modelHasChanged = false;

      // Fields
      map(values?.fields || {}, (field, fieldKey) => {
        if (originalModel.fields[fieldKey]) {
          console.log(`Deleting ${modelKey} field ${fieldKey}.`);
          delete originalModel.fields[fieldKey];
          originalModel.markModified("fields");
          modelHasChanged = true;
        }
      });

      // Overviews
      map(values?.overviews || {}, (overview, overviewKey) => {
        if (originalModel.overviews[overviewKey]) {
          console.log(`Deleting ${modelKey} overview ${overviewKey}.`);
          delete originalModel.overviews[overviewKey];
          originalModel.markModified("overviews");
          modelHasChanged = true;
        }
      });

      // Layouts
      map(values?.layouts || {}, (layout, layoutKey) => {
        if (originalModel.layouts[layoutKey]) {
          console.log(`Deleting ${modelKey} layout ${layoutKey}.`);
          delete originalModel.layouts[layoutKey];
          originalModel.markModified("layouts");
          modelHasChanged = true;
        }
      });

      // Lists
      map(values?.lists || {}, (list, listKey) => {
        if ((originalModel.lists || {})[listKey]) {
          console.log(`Deleting ${modelKey} list ${listKey}.`);
          delete originalModel.lists[listKey];
          originalModel.markModified("lists");
          modelHasChanged = true;
        }
      });

      // Dropdown options
      map(values?.dropdown_options || {}, (options, optionsKey) => {
        // Loop through options
        options.map((newOption) => {
          originalModel.fields[optionsKey].typeArgs.options.map(
            (oldOption, oldOptionIndex) => {
              if (oldOption.key === newOption.key) {
                console.log(
                  `Deleting option for ${modelKey}-${optionsKey}: ${newOption.key}`
                );
                originalModel.fields[optionsKey].typeArgs.options.splice(
                  oldOptionIndex,
                  1
                );
              }
            }
          );
        });
      });

      if (modelHasChanged) {
        await originalModel.save();
      }
    });

    resolve();
  });
