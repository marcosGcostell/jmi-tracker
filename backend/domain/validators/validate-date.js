export default date => {
  return date instanceof Date && !isNaN(date.getTime());
};
