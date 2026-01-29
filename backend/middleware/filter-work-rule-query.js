import qs from 'qs';

import catchAsync from '../utils/catch-async.js';
import valildateUUID from '../domain/validators/validate-uuid.js';

const filterWorkRuleQuery = catchAsync(async (req, res, next) => {
  const { workSiteId, companyId } = { ...qs.parse(req.query) };

  if (workSiteId && valildateUUID(workSiteId)) req.workSiteId = workSiteId;
  if (companyId && valildateUUID(companyId)) req.companyId = companyId;

  next();
});

export default filterWorkRuleQuery;
