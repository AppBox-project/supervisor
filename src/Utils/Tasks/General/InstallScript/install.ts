import { install as createModel } from "./createModel";
import { install as registerApp } from "./registerApp";
import { install as registerSystemValues } from "./registerSystemValues";
import { install as installClient } from "./installClient";
import { install as installStandAlone } from "./installStandAlone";
import { install as installBackend } from "./installBackend";
import { install as compile } from "./compile";
import { install as cleanUp } from "./cleanUp";

export default {
  createModel,
  registerApp,
  registerSystemValues,
  installClient,
  installStandAlone,
  installBackend,
  compile,
  cleanUp,
};
