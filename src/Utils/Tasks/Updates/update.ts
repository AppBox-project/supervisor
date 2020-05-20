var shell = require("shelljs");

export default async (task, models) => {
  console.log("Starting update process");

  // Step 1: Client
  let result = await shell.exec("git -C /AppBox/System/Client pull");
  // Todo: does language matter here?
  if (!result.match("up to date")) {
    console.log("Client update found. Installing and recompiling.");
    task.data.state = "Updates found. Installing and recompiling client.";
    task.data.progress = 25;
    task.data.done = false;
    task.markModified("data");
    await task.save();

    await shell.exec(
      "yarn --cwd ../Client install && yarn --cwd ../Client build"
    );
  }

  // Step 2: Server
  task.data.state = "Looking for Server updates";
  task.data.progress = 50;
  task.markModified("data");
  await task.save();

  result = await shell.exec("git -C /AppBox/System/Server pull");
  if (!result.match("up to date")) {
    task.data.state = "Server: Installing dependencies";
    task.data.progress = 60;
    task.markModified("data");
    await task.save();
    result = await shell.exec("yarn --cwd ../Server install");
  }

  // Step 3: SiteServer
  task.data.state = "Looking for SiteServer updates";
  task.data.progress = 70;
  task.markModified("data");
  await task.save();

  result = await shell.exec("git -C /AppBox/System/SiteServer pull");
  if (!result.match("up to date")) {
    task.data.state = "SiteServer: Installing dependencies";
    task.data.progress = 80;
    task.markModified("data");
    await task.save();
    result = await shell.exec("yarn --cwd ../Server install");
  }

  // Step 3: SiteServer
  task.data.state = "Looking for SiteServer updates";
  task.data.progress = 90;
  task.markModified("data");
  await task.save();

  result = await shell.exec("git -C /AppBox/System/SiteServer pull");
  if (!result.match("up to date")) {
    task.data.state = "SiteServer: Installing dependencies";
    task.data.progress = 95;
    task.markModified("data");
    await task.save();
    result = await shell.exec("yarn --cwd ../Server install");
  }

  // Step 4: Supervisor
  task.data.state = "Done";
  task.data.progress = 100;
  task.data.done = true;
  task.markModified("data");
  await task.save();

  result = await shell.exec(
    "git -C /AppBox/System/Supervisor pull  && yarn --cwd /AppBox/System/Supervisor install"
  );
};
