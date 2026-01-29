export default validateDate = date => {
  return date instanceof Date && !isNaN(date.getTime());
};
