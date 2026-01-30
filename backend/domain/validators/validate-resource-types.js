import { RESOURCE_TYPES } from '../../utils/config.js';

export default data => {
  return (
    typeof data === 'string' &&
    data.trim() &&
    RESOURCE_TYPES.includes(data.trim())
  );
};
