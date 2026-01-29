export const parseSort = sortString => {
  if (!sortString) return [];

  return sortString
    .split(',')
    .map(param =>
      param.trim().startsWith('-')
        ? { field: param.slice(1), order: 'DESC' }
        : { field: param.slice, order: 'ASC' },
    );
};

export const filterSort = (sortData, allowedFields) =>
  sortData.filter(el => allowedFields.has(el.field));

export const sortDataToSQL = (sortData, aliases) =>
  sortData.map(el => ` ${aliases[el.field]} ${el.order}`).join(',');
