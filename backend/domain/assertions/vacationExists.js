import * as Vacation from '../../models/vacation.model.js';
import AppError from '../../utils/app-error.js';

export default async (id, client = undefined) => {
  const vacation = await Vacation.getVacation(id, client);
  if (!vacation?.id) {
    throw new AppError(404, 'No se encuentra el registro de vacaciones.');
  }

  return vacation;
};
