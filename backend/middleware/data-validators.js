import catchAsync from '../utils/catch-async.js';
import AppError from '../utils/app-error.js';
import { validateDate } from '../utils/validators.js';
import { RESOURCE_TYPES, UUID_REGEX, TIME_REGEX } from '../utils/config.js';

const validators = {
  text: data => typeof data === 'string' && data.trim(),
  date: data => validateDate(new Date(data)),
  time: data => typeof data === 'string' && TIME_REGEX.test(data),
  id: data => typeof data === 'string' && UUID_REGEX.test(data),
  int: data => !isNaN(data),
  resource: data =>
    typeof data === 'string' &&
    data.trim() &&
    RESOURCE_TYPES.includes(data.trim()),
};

export const checkRecordFields = recordFields => {
  return catchAsync(async (req, res, next) => {
    const errors = { isMissing: '', badFormat: '' };

    recordFields.forEach(field => {
      const value = req.body[field.name];
      if (field.required && (value === undefined || value === null)) {
        errors.isMissing += ` - ${field.message}`;
        return;
      }
      if (value && !validators[field.type](value))
        errors.badFormat += ` - ${field.message}`;
    });

    if (errors.isMissing) {
      return next(
        new AppError(
          400,
          `Para crear el recurso faltan los siguientes datos${errors.isMissing}`,
        ),
      );
    }

    if (errors.badFormat) {
      return next(
        new AppError(
          400,
          `Los siguientes datos no están en el formato correcto${errors.badFormat}`,
        ),
      );
    }

    next();
  });
};

export const checkFieldsForUpdate = recordFields => {
  const fieldsToUpdate = recordFields.map(field => ({
    ...field,
    required: false,
  }));

  return checkRecordFields(fieldsToUpdate);
};
