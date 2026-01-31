import { getPool } from '../db/pool.js';

export const getAllCategories = async (client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT g.id, g.name, g.company_id, c.name AS company_name
    FROM categories g
    LEFT JOIN companies c ON g.company_id = c.id
    ORDER BY g.company_id ASC NULLS FIRST, g.name ASC
    `,
  );

  return rows;
};

export const getCompanyCategories = async (
  companyId,
  plusGlobal,
  client = getPool(),
) => {
  const globalCondition = plusGlobal ? 'OR g.company_id IS null' : '';

  const { rows } = await client.query(
    `
    SELECT g.id, g.name, g.company_id, c.name AS company_name
    FROM categories g
    LEFT JOIN companies c ON g.company_id = c.id
    WHERE g.company_id = $1 ${globalCondition}
    ORDER BY c.name ASC NULLS FIRST, g.name ASC
    `,
    [companyId],
  );

  return rows;
};

export const getCategory = async (id, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT g.id, g.name, g.company_id, c.name AS company_name
    FROM categories g
    LEFT JOIN companies c ON g.company_id = c.id
    WHERE g.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const findCategory = async (companyId, name, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT g.id, g.name, g.company_id, c.name AS company_name
    FROM categories g
    LEFT JOIN companies c ON g.company_id = c.id
    WHERE g.company_id = $1 AND g.name = $2
    `,
    [companyId, name],
  );

  return rows[0];
};

export const createCategory = async (data, client = getPool()) => {
  try {
    const { name, companyId } = data;

    const { rows } = await client.query(
      `
    INSERT INTO categories (name, company_id)
    VALUES ($1, $2)
    RETURNING id, name, company_id
  `,
      [name, companyId],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const updateCategory = async (id, name, client = getPool()) => {
  try {
    const { rows } = await client.query(
      `
    UPDATE categories
    SET name = $1
    WHERE id = $2
    RETURNING id, name, company_id
  `,
      [name, id],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const deleteCategory = async (id, client = getPool()) => {
  const { rowCount, rows } = await client.query(
    `
    DELETE 
    FROM categories
    WHERE id = $1
    RETURNING id
  `,
    [id],
  );

  return rowCount ? { id: rows[0].id } : null;
};
