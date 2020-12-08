var shell = require("shelljs");

export default async (task, models) => {
  console.log("Starting update process");

  // Step 1: Client
  let result = await shell.exec("git -C /AppBox/System/Client pull");
  // Todo: does language matter here?
  if (!result.match("up to date")) {
    console.log("Client update found. Installing and recompiling.");
    task.data.state = "Updates found. Installing and recompiling client.";
    task.data.progress = 10;
    task.data.done = false;
    task.markModified("data");
    await task.save();

    await shell.exec(
      "yarn --cwd ../Client install && yarn --cwd ../Client build"
    );
  }

  // Step 2: Server
  task.data.state = "Looking for Server updates";
  task.data.progress = 25;
  task.markModified("data");
  await task.save();

  result = await shell.exec("git -C /AppBox/System/Server pull");
  if (!result.match("up to date")) {
    task.data.state = "Server: Installing dependencies";
    task.data.progress = 30;
    task.markModified("data");
    await task.save();
    result = await shell.exec("yarn --cwd ../Server install");
  }

  // Step 3: Engine
  task.data.state = "Looking for Engine updates";
  task.data.progress = 50;
  task.markModified("data");
  await task.save();

  result = await shell.exec("git -C /AppBox/System/Engine pull");
  if (!result.match("up to date")) {
    task.data.state = "Engine: Installing dependencies";
    task.data.progress = 55;
    task.markModified("data");
    await task.save();
    result = await shell.exec("yarn --cwd ../Engine install");
  }

  // Step 4: App-Server
  task.data.state = "Looking for App-Server updates";
  task.data.progress = 75;
  task.markModified("data");
  await task.save();

  result = await shell.exec("git -C /AppBox/System/App-Server pull");
  if (!result.match("up to date")) {
    task.data.state = "App-Server: Installing dependencies";
    task.data.progress = 80;
    task.markModified("data");
    await task.save();
    result = await shell.exec("yarn --cwd ../App-Server install");
  }

  // Step 5: Supervisor
  task.data.state = "Done";
  task.data.progress = 100;
  task.data.done = true;
  task.markModified("data");
  await task.save();

  result = await shell.exec(
    "git -C /AppBox/System/Supervisor pull  && yarn --cwd /AppBox/System/Supervisor install"
  );
  await shell.exec("yarn restart");
};
