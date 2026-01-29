import * as Category from '../models/category.model.js';
import * as Resource from '../models/resource.model.js';
import AppError from '../utils/app-error.js';

export const getAllCategories = async () => {
  return Category.getAllCategories();
};

export const getCategory = async id => {
  const category = await Category.getCategory(id);
  if (!category) {
    throw new AppError(400, 'El trabajador o equipo no existe.');
  }

  return category;
};

export const createCategory = async data => {
  const { name, companyId } = data;

  const categoryAlreadyExist = await Category.findCategory(
    companyId,
    name.trim(),
  );
  if (categoryAlreadyExist)
    throw new AppError(
      409,
      'Ya existe una categoría con este nombre en esta empresa.',
    );

  const category = await Category.createCategory({
    companyId,
    name: name.trim(),
  });

  return category;
};

export const updateCategory = async (id, name) => {
  const category = await Category.getCategory(id);
  if (!category) {
    throw new AppError(400, 'La categoría no existe.');
  }

  const newName = name?.trim() || category.name;

  return Category.updateCategory(id, newName);
};

export const deleteCategory = async id => {
  const category = await Category.getCategory(id);
  if (!category) throw new AppError(400, 'La categoría no existe.');

  const usedInResources = await Resource.getResourcesWithCategory(id);
  if (!usedInResources.length)
    throw new AppError(
      400,
      'La categoría no se puede borrar porque está siendo usada por algún recurso.',
    );

  return Category.deleteCategory(category.id);
};
