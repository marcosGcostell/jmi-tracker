import * as User from '../../models/user.model.js';

const userExists = async id => {
  const user = await User.getUser(id);
  if (!user) {
    throw new AppError(404, 'El usuario no existe.');
  }

  return user;
};

export default userExists;
