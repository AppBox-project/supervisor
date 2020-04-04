import nunjucks from "../Utils/nunjucks";
import { map, set, get, findIndex } from "lodash";

export const calculateFormulaFromId = async (
  formula,
  contextId,
  dependencies,
  models
) => {
  // Step 1: fetch basemodel
  return new Promise(async (resolve, reject) => {
    let data = await models.entries.model.findOne({ _id: contextId });
    data = data.data;

    dependencies.map(async (dependency) => {
      if (dependency.match("\\.")) {
        // Levelled dependency
        let path = "";
        data = await dependency
          .split(".")
          .reduce(async (previousPromise, pathPart) => {
            let newData = await previousPromise;
            if (newData.length < 1) newData = data; // Only on first run

            // Find path
            path = path + pathPart;
            if (path.match("_r")) path += ".";
            const subPath = path.replace(new RegExp("\\.$"), "");
            const idPath = subPath.replace(new RegExp("\\_r$"), "");

            // Follow the relationships and add the data
            if (pathPart.match("_r")) {
              const _id = get(data, idPath);
              const subData = await models.entries.model.findOne({ _id });
              newData = set(newData, subPath, subData.data);
            }

            return newData;
          }, Promise.resolve([]));

        // Done
        // Todo -> this currently happens once per dependency. Lift out to promise reduction
        resolve(nunjucks.renderString(formula, data));
      } else {
        resolve(nunjucks.renderString(formula, data));
      }
    });
  });
};
