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
        layouts: { [key: string]: {} };
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
    console.log("Registering system values");
    const values = args.values;

    // People
    if (values.people) {
      const people = values.people;
      const currentPeopleModel = await models.models.model.findOne({
        key: "people",
      });
      let peopleModelHasChanged = false;

      // Fields
      if (people.fields) {
        const fields: {
          [key: string]: { name; type; typeArgs: { type; formula } };
        } = people.fields;

        map(fields, (field, fieldKey) => {
          if (!currentPeopleModel.fields[fieldKey]) {
            console.log(`Adding field ${fieldKey}`);
            currentPeopleModel.fields[fieldKey] = field;
            currentPeopleModel.markModified(`fields.${fieldKey}`);
            peopleModelHasChanged = true;
          }
        });
      }

      // Overviews
      if (people.overviews) {
        const overviews: {
          [key: string]: {};
        } = people.overviews;

        map(overviews, (overview, overviewKey) => {
          if (!currentPeopleModel.overviews[overviewKey]) {
            console.log(`Adding overview ${overviewKey}`);
            currentPeopleModel.overviews[overviewKey] = overview;
            currentPeopleModel.markModified(`overviews.${overviewKey}`);
            peopleModelHasChanged = true;
          }
        });
      }

      // Layouts
      if (people.layouts) {
        const layouts: {
          [key: string]: {};
        } = people.layouts;

        map(layouts, (layout, layoutKey) => {
          if (!currentPeopleModel.layouts[layoutKey]) {
            console.log(`Adding layout ${layoutKey}`);
            currentPeopleModel.layouts[layoutKey] = layout;
            currentPeopleModel.markModified(`layouts.${layoutKey}`);
            peopleModelHasChanged = true;
          }
        });
      }

      // Types
      if (people.types) {
        //@ts-ignore
        const types: { label: string; key: string }[] = people.types;
        types.map((type) => {
          let typeExists = false;
          currentPeopleModel.fields.types.typeArgs.options.map(
            (option, key) => {
              if (option.key === type.key) {
                typeExists = true;
              }

              // If the withList option is selected add a list (if it doesn't exist yet.)
              if (option.withList) {
                if (!currentPeopleModel.lists[option.key]) {
                  currentPeopleModel.lists[option.key] = {
                    name: option.listName || option.label,
                    filter: [
                      {
                        key: "types",
                        operator: "equals",
                        value: option.key,
                      },
                    ],
                  };
                  currentPeopleModel.markModified(`lists.${option.key}`);
                }
              }
            }
          );
          if (!typeExists) {
            peopleModelHasChanged = true;
            (currentPeopleModel.fields.types.typeArgs.options as any[]).push(
              type
            );
            currentPeopleModel.markModified("fields.types.typeArgs.options");
            console.log(`Added people type ${type.label}`);
          }
        });
      }

      await currentPeopleModel.save();
    }

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
    console.log(`Checking for system value updates`);
    const values = args.values;

    // People
    if (values.people) {
      const people = values.people;
      const currentPeopleModel = await models.models.model.findOne({
        key: "people",
      });
      let peopleModelHasChanged = false;

      // Fields
      if (people.fields) {
        const fields: {
          [key: string]: { name; type; typeArgs: { type; formula } };
        } = people.fields;

        map(fields, (field, fieldKey) => {
          if (!currentPeopleModel.fields[fieldKey]) {
            console.log(`Adding field ${fieldKey}`);
            currentPeopleModel.fields[fieldKey] = field;
            currentPeopleModel.markModified(`fields.${fieldKey}`);
            peopleModelHasChanged = true;
          }
        });
      }

      // Overviews
      if (people.overviews) {
        const overviews: {
          [key: string]: {};
        } = people.overviews;

        map(overviews, (overview, overviewKey) => {
          if (!currentPeopleModel.overviews[overviewKey]) {
            console.log(`Adding overview ${overviewKey}`);
            currentPeopleModel.overviews[overviewKey] = overview;
            currentPeopleModel.markModified(`overviews.${overviewKey}`);
            peopleModelHasChanged = true;
          }
        });
      }

      // Layouts
      if (people.layouts) {
        const layouts: {
          [key: string]: {};
        } = people.layouts;

        map(layouts, (layout, layoutKey) => {
          if (!currentPeopleModel.layouts[layoutKey]) {
            console.log(`Adding layout ${layoutKey}`);
            currentPeopleModel.layouts[layoutKey] = layout;
            currentPeopleModel.markModified(`layouts.${layoutKey}`);
            peopleModelHasChanged = true;
          }
        });
      }

      // Types
      if (people.types) {
        //@ts-ignore
        const types: {
          label: string;
          key: string;
          withList?: boolean;
          listName?: string;
        }[] = people.types;
        types.map((type) => {
          let typeExists = false;
          currentPeopleModel.fields.types.typeArgs.options.map(
            (option, key) => {
              if (option.key === type.key) {
                typeExists = true;
              }

              // If the withList option is selected add a list (if it doesn't exist yet.)
              if (type.withList) {
                if (!(currentPeopleModel.lists || {})[type.key]) {
                  currentPeopleModel.lists[type.key] = {
                    name: type.listName || type.label,
                    filter: [
                      {
                        key: "types",
                        operator: "equals",
                        value: type.key,
                      },
                    ],
                  };
                  currentPeopleModel.markModified(`lists.${type.key}`);
                  peopleModelHasChanged = true;
                }
              }
            }
          );

          if (!typeExists) {
            peopleModelHasChanged = true;
            (currentPeopleModel.fields.types.typeArgs.options as any[]).push(
              type
            );
            currentPeopleModel.markModified("fields.types.typeArgs.options");
            console.log(`Added people type ${type.label}`);
          }
        });
      }

      if (peopleModelHasChanged) await currentPeopleModel.save();
    }

    resolve();
  });

// Uninstall
export const uninstall = (
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
    console.log(`Deleting system value updates`);
    const values = args.values;
    // People
    if (values.people) {
      const people = values.people;
      const currentPeopleModel = await models.models.model.findOne({
        key: "people",
      });
      let peopleModelHasChanged = false;

      // Fields
      if (people.fields) {
        const fields: {
          [key: string]: { name; type; typeArgs: { type; formula } };
        } = people.fields;

        map(fields, (field, fieldKey) => {
          if (currentPeopleModel.fields[fieldKey]) {
            console.log(`Deleting field ${fieldKey}`);
            delete currentPeopleModel.fields[fieldKey];
            currentPeopleModel.markModified(`fields.${fieldKey}`);
            peopleModelHasChanged = true;
          }
        });
      }

      // Overviews
      if (people.overviews) {
        const overviews: {
          [key: string]: {};
        } = people.overviews;

        map(overviews, (overview, overviewKey) => {
          if (currentPeopleModel.overviews[overviewKey]) {
            console.log(`Deleting overview ${overviewKey}`);
            delete currentPeopleModel.overviews[overviewKey];
            currentPeopleModel.markModified(`overviews.${overviewKey}`);
            peopleModelHasChanged = true;
          }
        });
      }

      // Layouts
      if (people.layouts) {
        const layouts: {
          [key: string]: {};
        } = people.layouts;

        map(layouts, (layout, layoutKey) => {
          if (currentPeopleModel.layouts[layoutKey]) {
            console.log(`Deleting layout ${layoutKey}`);
            delete currentPeopleModel.layouts[layoutKey];
            currentPeopleModel.markModified(`layouts.${layoutKey}`);
            peopleModelHasChanged = true;
          }
        });
      }

      // Types
      if (people.types) {
        //@ts-ignore
        const types: {
          label: string;
          key: string;
          withList?: boolean;
          listName?: string;
        }[] = people.types;
        types.map((type) => {
          currentPeopleModel.fields.types.typeArgs.options.splice(
            findIndex(
              currentPeopleModel.fields.types.typeArgs.options,
              (o: { key; label }) => o.key === type.key
            ),
            1
          );

          currentPeopleModel.markModified("fields.types.typeArgs.options");

          if (type.withList) {
            // This type came with a list. Remove it.
            if ((currentPeopleModel.lists || [])[type.key]) {
              delete currentPeopleModel.lists[type.key];
              currentPeopleModel.markModified("fields.lists");
            }
          }
        });
      }

      await currentPeopleModel.save();
    }

    resolve();
  });
