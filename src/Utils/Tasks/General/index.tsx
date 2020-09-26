import installApp from "./installApp";
import uninstallApp from "./uninstallApp";
import updateApp from "./updateApp";
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
  updateApp,
  uninstallApp,
  restartSystem,
  restartSupervisor,
  restartServer,
  restartEngine,
};
