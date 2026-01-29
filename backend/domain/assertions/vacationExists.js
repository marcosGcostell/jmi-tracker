import * as Vacation from '../../models/vacation.model.js';

export default workSiteExists = async id => {
  const vacation = await Vacation.getVacation(id);
  if (!vacation?.id) {
    throw new AppError(404, 'No se encuentra el registro de vacaciones.');
  }

  return vacation;
};
