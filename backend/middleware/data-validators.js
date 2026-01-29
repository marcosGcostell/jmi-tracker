import catchAsync from '../utils/catch-async.js';
import AppError from '../utils/app-error.js';
import { validateDate } from '../utils/validators.js';
import { RESOURCE_TYPES } from '../utils/config.js';

const _hasInvalidDates = (req, requiredFields) =>
  requiredFields.varNames.reduce((acc, varName, i) => {
    if (requiredFields.varTypes[i] === 'date')
      return (
        acc || (req.body[varName] && !validateDate(new Date(req.body[varName])))
      );
    return acc;
  }, false);

const _hasInvalidUUIDs = (req, requiredFields) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return requiredFields.varNames.reduce((acc, varName, i) => {
    if (requiredFields.varTypes[i] === 'id')
      return acc || !uuidRegex.test(req.body[varName]);
    return acc;
  }, false);
};

export const checkRequiredFields = requiredFields => {
  return catchAsync(async (req, res, next) => {
    const isMissing = requiredFields.varNames.reduce((acc, varName, i) => {
      if (requiredFields.varTypes[i] === 'text')
        return acc || !req.body[varName]?.trim();
      else
        return (
          acc || req.body[varName] === undefined || req.body[varName] === null
        );
    }, false);

    if (isMissing) {
      return next(new AppError(400, requiredFields.errorMessage));
    }

    if (_hasInvalidDates(req, requiredFields)) {
      return next(
        new AppError(
          400,
          'Las fechas suministradas no están en el formato correcto.',
        ),
      );
    }

    if (_hasInvalidUUIDs(req, requiredFields)) {
      return next(
        new AppError(
          400,
          'Los identificadores que referencian a otro recurso no son del formato correcto.',
        ),
      );
    }

    next();
  });
};

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

export const validateDataForCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return next(
      new AppError(400, 'Se necesita un nombre para crear una categoría.'),
    );
  }
  next();
});
