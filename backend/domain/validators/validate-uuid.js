import { UUID_REGEX } from '../../utils/config.js';

export default data => {
  return typeof data === 'string' && UUID_REGEX.test(data);
};
