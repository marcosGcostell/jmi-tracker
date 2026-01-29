import * as Vacation from '../../models/vacation.model.js';

const vacationExists = async id => {
  const vacation = await Vacation.getVacation(id);
  if (!vacation?.id) {
    throw new AppError(404, 'No se encuentra el registro de vacaciones.');
  }

  return vacation;
};

export default vacationExists;
