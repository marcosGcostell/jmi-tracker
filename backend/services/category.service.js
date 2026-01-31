import * as Category from '../models/category.model.js';
import * as Resource from '../models/resource.model.js';
import categoryExists from '../domain/assertions/categoryExists.js';
import { getPool } from '../db/pool.js';
import AppError from '../utils/app-error.js';

export const getAllCategories = async () => {
  return Category.getAllCategories();
};

export const getCategory = async id => {
  return categoryExists(id);
};

export const createCategory = async data => {
  const { name, companyId } = data;
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const categoryAlreadyExist = await Category.findCategory(
      companyId,
      name.trim(),
      client,
    );
    if (categoryAlreadyExist)
      throw new AppError(
        400,
        'Ya existe una categoría con este nombre en esta empresa.',
      );

    const category = await Category.createCategory(
      {
        companyId,
        name: name.trim(),
      },
      client,
    );

    await client.query('COMMIT');
    return category;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateCategory = async (id, name) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const category = await categoryExists(id, client);
    const newName = name?.trim() || category.name;

    const updatedCategory = await Category.updateCategory(id, newName, client);
    await client.query('COMMIT');
    return updatedCategory;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const deleteCategory = async id => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const category = await categoryExists(id, client);

    const usedInResources = await Resource.getResourcesWithCategory(id, client);
    if (usedInResources.length)
      throw new AppError(
        400,
        'La categoría no se puede borrar porque está siendo usada por algún recurso.',
      );

    const deletedCategory = await Category.deleteCategory(category.id, client);
    await client.query('COMMIT');
    return deletedCategory;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
