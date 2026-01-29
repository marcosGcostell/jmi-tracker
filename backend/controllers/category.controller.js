import * as categoryService from '../services/category.service.js';
import catchAsync from '../utils/catch-async.js';

export const getAllCategories = catchAsync(async (req, res, next) => {
  // Execute the query
  const categories = await categoryService.getAllCategories();

  // Send response
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  // Execute the query
  const category = await categoryService.getCategory(req.params.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const createCategory = catchAsync(async (req, res, next) => {
  // Execute the query
  const category = await categoryService.createCategory(req.body);

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  // Execute the query
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body?.name,
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.deleteCategory(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});
