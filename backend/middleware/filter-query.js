import qs from 'qs';

import catchAsync from '../utils/catch-async.js';
import parseBooleanQuery from '../utils/parse-boolean-query.js';
import { validateDate } from '../utils/validators.js';

const filterQuery = catchAsync(async (req, res, next) => {
  const { active, date } = { ...qs.parse(req.query) };

  req.active = parseBooleanQuery(active, true);
  if (date && validateDate(new Date(date))) {
    req.date = new Date(date);
  }
  next();
});

export default filterQuery;
