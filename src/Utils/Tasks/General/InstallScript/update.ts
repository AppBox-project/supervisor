import { update as createModel } from "./createModel";
import { update as registerApp } from "./registerApp";
import { update as registerSystemValues } from "./registerSystemValues";
import { update as installClient } from "./installClient";
import { update as installBackend } from "./installBackend";
import { update as installStandAlone } from "./installStandAlone";
import { update as compile } from "./compile";
import { update as cleanUp } from "./cleanUp";
import { update as insertObjects } from "./insertObjects";

export default {
  createModel,
  registerApp,
  registerSystemValues,
  installBackend,
  installClient,
  installStandAlone,
  compile,
  cleanUp,
  insertObjects,
};
