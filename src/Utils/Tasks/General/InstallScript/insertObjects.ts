import { AppBoxData } from "../../../Utils/Types";

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
    console.log("Inserting objects");
    const objects = data.objects;

    console.log(objects);

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
    console.log(`Checking for object updates`);
    const objects = data.objects;

    // People
    console.log(objects);

    resolve();
  });
