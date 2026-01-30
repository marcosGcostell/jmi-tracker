import * as Vacation from '../../models/vacation.model.js';

export default async (id, client = undefined) => {
  const vacation = await Vacation.getVacation(id);
  if (!vacation?.id) {
    throw new AppError(404, 'No se encuentra el registro de vacaciones.');
  }

  return vacation;
};
