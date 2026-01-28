import catchAsync from '../utils/catch-async.js';
import AppError from '../utils/app-error.js';
import { validateDate } from '../utils/validators.js';
import { RESOURCE_TYPES } from '../utils/config.js';

export const validateDataForCompany = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return next(
      new AppError(400, 'Se necesita un nombre para crear una empresa.'),
    );
  }
  next();
});

export const validateDataForResource = catchAsync(async (req, res, next) => {
  const { companyId, categoryId, name, resourceType } = req.body;

  if (!companyId || !categoryId || !name?.trim()) {
    return next(
      new AppError(
        400,
        'Para crear un recurso se necesita un nombre y seleccionar la empresa y la categoría a la que pertenece.',
      ),
    );
  }

  if (resourceType && !RESOURCE_TYPES.includes(resourceType))
    throw new AppError(
      400,
      'Sólo se puede crear un recurso de los tipos: persona, equipo o vehículo.',
    );

  next();
});

export const validateDataForWorkSites = catchAsync(async (req, res, next) => {
  const { name, code, startDate } = req.body;

  if (!name?.trim() || !code?.trim()) {
    return next(
      new AppError(
        400,
        'Para crear una obra se necesita un nombre y un código.',
      ),
    );
  }

  if (startDate && !validateDate(new Date(startDate))) {
    return next(
      new AppError(
        400,
        'La fecha de inicio de la obra no está en el formato correcto.',
      ),
    );
  }

  next();
});

export const validateDataForVacations = catchAsync(async (req, res, next) => {
  const { resourceId, startDate, endDate } = req.body;

  if (!resourceId || !startDate || !endDate) {
    return next(
      new AppError(
        400,
        'Se necesita la identificación del trabajador, una fecha de comienzo y una fecha de final para establecer un periodo vacacional.',
      ),
    );
  }

  if (startDate && !validateDate(new Date(startDate))) {
    return next(
      new AppError(
        400,
        'La fecha de inicio de las vacaciones no está en el formato correcto.',
      ),
    );
  }

  if (endDate && !validateDate(new Date(endDate))) {
    return next(
      new AppError(
        400,
        'La fecha de fin de las vacaciones no está en el formato correcto.',
      ),
    );
  }

  next();
});

export const validateDataForSickLeaves = catchAsync(async (req, res, next) => {
  const { resourceId, startDate, endDate } = req.body;

  if (!resourceId || !startDate) {
    return next(
      new AppError(
        400,
        'Se necesita la identificación del trabajador y una fecha de comienzo para establecer un periodo de baja.',
      ),
    );
  }

  if (startDate && !validateDate(new Date(startDate))) {
    return next(
      new AppError(
        400,
        'La fecha de inicio de la baja no está en el formato correcto.',
      ),
    );
  }

  if (endDate && !validateDate(new Date(endDate))) {
    return next(
      new AppError(
        400,
        'La fecha de fin de la baja no está en el formato correcto.',
      ),
    );
  }

  next();
});
