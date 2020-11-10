import { AppBoxData } from "../../../Utils/Types";
import { map } from "lodash";

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

      // Types
      if (people.types) {
        const types = people.types;
        types.map(
          (type: string) =>
            // Add option (if it doesn't exist)
            !(currentPeopleModel.fields.types.typeArgs
              .options as string[]).includes(type) &&
            (currentPeopleModel.fields.types.typeArgs.options as string[]).push(
              type
            )
        );
        currentPeopleModel.markModified("fields.types.typeArgs.options");
      }

      await currentPeopleModel.save();
    }

    resolve();
  });

export const update = (
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
        const types: { label: string; key: string }[] = people.types;
        types.map((type) => {
          let typeExists = false;
          currentPeopleModel.fields.types.typeArgs.options.map(
            (option, key) => {
              if (option.key === type.key) {
                typeExists = true;
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
