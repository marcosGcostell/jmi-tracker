import qs from 'qs';

import catchAsync from '../utils/catch-async.js';
import parseBooleanQuery from '../utils/parse-boolean-query.js';

const filterQuery = catchAsync(async (req, res, next) => {
  const { active } = { ...qs.parse(req.query) };

  req.active = parseBooleanQuery(active, true);
  next();
});

export default filterQuery;
