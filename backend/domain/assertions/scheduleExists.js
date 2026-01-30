import * as Schedule from '../../models/schedule.model.js';

export default async (id, client = undefined) => {
  const schedule = await Schedule.getSchedule(id);
  if (!schedule) {
    throw new AppError(
      404,
      'No se encuentra el horario predeterminado para esta empresa.',
    );
  }

  return schedule;
};
