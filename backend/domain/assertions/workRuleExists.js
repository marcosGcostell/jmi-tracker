import * as WorkRule from '../../models/work-rule.model.js';

export default async (id, client = undefined) => {
  const workRule = await WorkRule.getWorkRule(id);
  if (!workRule?.id) {
    throw new AppError(404, 'No se encuentra la regla de configuración.');
  }

  return workRule;
};
