import * as Category from '../../models/category.model.js';
import AppError from '../../utils/app-error.js';

export default async (id, client = undefined) => {
  const category = await Category.getCategory(id, client);
  if (!category) {
    throw new AppError(404, 'La categoría no existe.');
  }

  return category;
};
