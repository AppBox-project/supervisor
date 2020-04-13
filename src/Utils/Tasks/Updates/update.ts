var shell = require("shelljs");

export default async (task, models) => {
  console.log("Starting update process", task);

  // After this
  const taskObject = await models.entries.model.findOne({ _id: task._id });
  taskObject.data.done = true;
  taskObject.markModified("data");
  await taskObject.save();

  // Client
  shell.exec("yarn updateBox");
};
