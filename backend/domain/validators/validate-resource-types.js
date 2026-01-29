import { RESOURCE_TYPES } from '../../utils/config';

export default validateResourceTypes = data => {
  return (
    typeof data === 'string' &&
    data.trim() &&
    RESOURCE_TYPES.includes(data.trim())
  );
};
