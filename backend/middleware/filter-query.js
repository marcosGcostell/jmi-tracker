import qs from 'qs';

import catchAsync from '../utils/catch-async.js';
import parseBooleanQuery from '../domain/helpers/parse-boolean-query.js';
import { parseSort } from '../domain/helpers/parse-sort.js';
import validateDate from '../domain/validators/validate-date.js';

const filterQuery = catchAsync(async (req, res, next) => {
  const { active, date, from, to, sort, extended } = { ...qs.parse(req.query) };

  req.active = parseBooleanQuery(active, true);
  if (date && validateDate(new Date(date))) {
    req.date = new Date(date);
  }

  if (from && validateDate(new Date(from))) {
    const filter = { from: new Date(from) };
    filter.to =
      to && validateDate(new Date(to)) ? new Date(to) : new Date(Date.now());

    req.period = filter;
  }

  if (sort) req.sort = parseSort(sort);

  if (extended) req.extended = true;

  next();
});

export default filterQuery;
