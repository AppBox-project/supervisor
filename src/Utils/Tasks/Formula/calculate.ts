import { calculateFormulaFromId } from "../../Functions/Formula";

export default async (task, models) => {
  console.log(`Launching task: batch recalculate formula's`);
  const formula = await models.objects.model.findOne({
    key: task.data.arguments.model,
  });
  const field = formula.fields[task.data.arguments.field];
  task.data.arguments.objects.map((objectId) => {
    calculateFormulaFromId(
      field.typeArgs.formula,
      objectId,
      field.typeArgs.dependencies,
      models
    ).then(async (response) => {
      const object = await models.entries.model.findOne({ _id: objectId });
      object.data[task.data.arguments.field] = response;
      object.markModified("data");
      object.save();
    });
  });

  task.data.done = true;
  task.markModified("data");
  task.save();
};
