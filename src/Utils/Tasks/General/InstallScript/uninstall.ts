import { uninstall as createModel } from "./createModel";
import { uninstall as registerApp } from "./registerApp";
import { uninstall as registerSystemValues } from "./registerSystemValues";
import { uninstall as installClient } from "./installClient";
import { uninstall as installBackend } from "./installBackend";
import { uninstall as installStandAlone } from "./installStandAlone";
import { uninstall as compile } from "./compile";
import { uninstall as cleanUp } from "./cleanUp";

export default {
  createModel,
  registerApp,
  installBackend,
  registerSystemValues,
  installClient,
  installStandAlone,
  compile,
  cleanUp,
};
