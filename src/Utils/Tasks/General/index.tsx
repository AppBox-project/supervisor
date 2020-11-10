import installApp from "./installApp";
import uninstallApp from "./uninstallApp";
import updateApps from "./updateApps";
import backup from "./backup";
import {
  restartSystem,
  restartSupervisor,
  restartServer,
  restartEngine,
} from "./server";

export default {
  backup,
  installApp,
  updateApps,
  uninstallApp,
  restartSystem,
  restartSupervisor,
  restartServer,
  restartEngine,
};
