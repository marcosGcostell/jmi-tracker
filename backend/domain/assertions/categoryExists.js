import * as Category from '../../models/category.model.js';

export default async (id, client = undefined) => {
  const category = await Category.getCategory(id);
  if (!category) {
    throw new AppError(404, 'La categoría no existe.');
  }

  return category;
};
