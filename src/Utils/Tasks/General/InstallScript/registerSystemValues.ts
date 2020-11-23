import { AppBoxData } from "appbox-types";

// This function registers data inside default objects.
export const install = (
  args: {
    values: { people?: { types: string[] } };
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
    console.log("Registering system values");
    const values = args.values;

    // People
    if (values.people) {
      const people = values.people;
      const currentPeopleModel = await models.models.model.findOne({
        key: "people",
      });
      let peopleModelHasChanged = false;

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
  new Promise(async (resolve, reject) => {
    console.log(`Checking for system value updates`);
    const values = args.values;

    // People
    if (values.people) {
      const people = values.people;
      const currentPeopleModel = await models.models.model.findOne({
        key: "people",
      });
      let peopleModelHasChanged = false;
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
