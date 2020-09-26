var shell = require("shelljs");

export const restartSystem = async (task, models) => {
  // Done
  task.data.state = "Rebooting";
  task.data.progress = 10;
  task.markModified("data");
  await task.save();
  await shell.exec(`yarn restart`);
  console.log("Rebooting system");

  // Done
  task.data.state = "Done";
  task.data.progress = 100;
  task.data.done = true;
  task.markModified("data");
  await task.save();
};

export const restartSupervisor = async (task, models) => {
  // Done
  task.data.state = "Rebooting";
  task.data.progress = 10;
  task.markModified("data");
  await task.save();
  await shell.exec(`yarn restartSupervisor`);
  console.log("Rebooting supervisor");

  // Done
  task.data.state = "Done";
  task.data.progress = 100;
  task.data.done = true;
  task.markModified("data");
  await task.save();
};

export const restartServer = async (task, models) => {
  // Done
  task.data.state = "Rebooting";
  task.data.progress = 10;
  task.markModified("data");
  await task.save();
  await shell.exec(`yarn restartServer`);
  console.log("Rebooting server");

  // Done
  task.data.state = "Done";
  task.data.progress = 100;
  task.data.done = true;
  task.markModified("data");
  await task.save();
};

export const restartEngine = async (task, models) => {
  // Done
  task.data.state = "Rebooting";
  task.data.progress = 10;
  task.markModified("data");
  await task.save();
  await shell.exec(`yarn restartEngine`);
  console.log("Rebooting engine");

  // Done
  task.data.state = "Done";
  task.data.progress = 100;
  task.data.done = true;
  task.markModified("data");
  await task.save();
};
