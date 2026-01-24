export const validateDataForCompany = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!fullName?.trim()) {
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
