export default (param, fallbackValue = null) => {
  if (param === undefined) return null;
  if (param === 'true') return true;
  if (param === 'false') return false;
  return fallbackValue;
};
