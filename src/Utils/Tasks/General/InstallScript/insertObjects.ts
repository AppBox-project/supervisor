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
  new Promise<void>(async (resolve, reject) => {
    console.log("Inserting objects");
    await models.objects.model.create(data.objects);

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
  new Promise<void>(async (resolve, reject) => {
    console.log(`Checking for object updates`);
    const objects = data.objects;

    // People
    console.log("Update objects: todo");

    resolve();
  });

// Uninstall
export const uninstall = (
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
  new Promise<void>(async (resolve, reject) => {
    console.log(`Removing objects`);
    const objects = data.objects;

    // People
    console.log("Uninstall objects: todo");

    resolve();
  });
