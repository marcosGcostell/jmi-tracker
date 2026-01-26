import catchAsync from '../utils/catch-async.js';
import AppError from '../utils/app-error.js';
import { validateDate } from '../utils/validators.js';

export const validateDataForCompany = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return next(
      new AppError(400, 'Se necesita un nombre para crear una empresa.'),
    );
  }
  next();
});

export const validateDataForWorker = catchAsync(async (req, res, next) => {
  const { companyId, fullName } = req.body;

  if (!companyId || !fullName?.trim()) {
    return next(
      new AppError(
        400,
        'Para crear un trabajador se necesita un nombre y seleccionar la empresa a la que pertenece.',
      ),
    );
  }
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
  const { workerId, startDate, endDate } = req.body;

  if (!workerId || !startDate || !endDate) {
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
