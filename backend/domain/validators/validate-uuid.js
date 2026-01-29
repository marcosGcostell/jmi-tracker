import { UUID_REGEX } from '../../utils/config';

export default validateUUID = data => {
  return typeof data === 'string' && UUID_REGEX.test(data);
};
