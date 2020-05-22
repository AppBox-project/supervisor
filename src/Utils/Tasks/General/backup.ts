export default async (task, models) => {
  const fs = require("fs");
  const dateSrc = new Date();
  const date = `${dateSrc.getFullYear()}-${
    dateSrc.getMonth() + 1
  }-${dateSrc.getDate()}--${dateSrc.getHours()}:${dateSrc.getSeconds()}`;

  console.log("Starting backup process");
  const dir = `/AppBox/Files/Backup/${date}/`;

  fs.mkdir(dir, { recursive: true }, (err) => {
    if (err) console.log(err);
  });

  // AppPermissions
  task.data.state = "Backing up App-Permissions";
  task.data.progress = 25;
  task.markModified("data");
  await task.save();
  await fs.writeFile(
    `${dir}AppPermissions.json`,
    JSON.stringify(await models.apppermissions.model.find({})),
    (err) => {
      if (err) console.log(err);
    }
  );

  // Objects
  task.data.state = "Backing up Objects";
  task.data.progress = 50;
  task.markModified("data");
  await task.save();
  await fs.writeFile(
    `${dir}Objects.json`,
    JSON.stringify(await models.entries.model.find({})),
    (err) => {
      if (err) console.log(err);
    }
  );

  // Models
  task.data.state = "Backing up Models";
  task.data.progress = 75;
  task.markModified("data");
  await task.save();
  await fs.writeFile(
    `${dir}Models.json`,
    JSON.stringify(await models.objects.model.find({})),
    (err) => {
      if (err) console.log(err);
    }
  );

  // UserSettings
  task.data.state = "Backing up User-Settings";
  task.data.progress = 99;
  task.markModified("data");
  await task.save();
  await fs.writeFile(
    `${dir}UserSettings.json`,
    JSON.stringify(await models.usersettings.model.find({})),
    (err) => {
      if (err) console.log(err);
    }
  );

  // Done
  task.data.state = `Backup can be found at ${dir}`;
  task.data.progress = 100;
  task.data.done = true;
  task.markModified("data");
  await task.save();
};
