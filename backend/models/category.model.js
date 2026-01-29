import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const getAllCategories = async () => {
  const { rows } = await pool().query(
    `
    SELECT g.id, g.name, g.company_id, c.name AS company_name
    FROM categories g
    LEFT JOIN companies c ON g.company_id = c.id
    ORDER BY g.company_id ASC NULLS FIRST, g.name ASC
    `,
  );

  return rows;
};

export const getCompanyCategories = async (companyId, plusGlobal) => {
  const globalCondition = plusGlobal ? 'OR g.company_id = null' : '';

  const { rows } = await pool().query(
    `
    SELECT g.id, g.name, g.company_id, c.name AS company_name
    FROM categories g
    LEFT JOIN companies c ON g.company_id = c.id
    WHERE g.company_id = $1 ${globalCondition}
    ORDER BY g.name ASC
    `,
    [companyId],
  );

  return rows;
};

export const getCategory = async id => {
  const { rows } = await pool().query(
    `
    SELECT g.id, g.name, g.company_id, c.name AS company_name
    FROM categories g
    INNER JOIN companies c ON g.company_id = c.id
    WHERE g.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const findCategory = async (companyId, name) => {
  const { rows } = await pool().query(
    `
    SELECT g.id, g.name, g.company_id, c.name AS company_name
    FROM categories g
    INNER JOIN companies c ON g.company_id = c.id
    WHERE g.company_id = $1 AND g.name = $2
    `,
    [companyId, name],
  );

  return rows[0];
};

export const createCategory = async data => {
  try {
    const { name, companyId } = data;

    const { rows } = await pool().query(
      `
    INSERT INTO categories (name, company_id)
    VALUES ($1, $2)
    RETURNING id, name
  `,
      [name, companyId],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const updateCategory = async (id, name) => {
  try {
    const { rows } = await pool().query(
      `
    UPDATE categories
    SET name = $1
    WHERE id = $2
    RETURNING id, name
  `,
      [name, id],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const deleteCategory = async id => {
  const client = await pool().connect();
  try {
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
  } finally {
    client.release();
  }
};
