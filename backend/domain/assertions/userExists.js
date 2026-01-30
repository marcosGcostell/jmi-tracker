import * as User from '../../models/user.model.js';

export default async (id, client = undefined) => {
  const user = await User.getUser(id);
  if (!user) {
    throw new AppError(404, 'El usuario no existe.');
  }

  return user;
};
