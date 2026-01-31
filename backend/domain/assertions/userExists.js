import * as User from '../../models/user.model.js';
import AppError from '../../utils/app-error.js';

export default async (id, client = undefined) => {
  const user = await User.getUser(id, client);
  if (!user) {
    throw new AppError(404, 'El usuario no existe.');
  }

  return user;
};
