export const systemLog = (msg: string | object) =>
  console.log(
    `Supervisor: ${typeof msg === "string" ? msg : JSON.stringify(msg)}`
  );
