import * as Category from '../../models/category.model.js';

export default categoryExists = async id => {
  const category = await Category.getCategory(id);
  if (!category) {
    throw new AppError(404, 'La categoría no existe.');
  }

  return category;
};
