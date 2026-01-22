import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const getAllCompanies = async () => {
  const { rows } = await pool().query(`
    SELECT id, name, is_main, active
    FROM companies
    ORDER BY name ASC
    `);

  return rows;
};

export const getCompany = async id => {
  const { rows } = await pool().query(
    `
    SELECT id, name, is_main, active
    FROM companies
    WHERE id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getCompanyByName = async name => {
  const { rows } = await pool().query(
    `
    SELECT id, name, is_main, active
    FROM companies
    WHERE name = $1
    `,
    [name],
  );

  return rows[0];
};

export const createCompany = async data => {
  const { name } = data;

  const { rows } = await pool().query(
    `
    INSERT INTO users (name)
    VALUES ($1)
    RETURNING id, name, is_main, active
  `,
    [name],
  );

  return rows[0];
};

export const updateCompany = async (id, data) => {
  const { name, isMain, active } = data;

  const { rows } = await pool().query(
    `
    UPDATE companies
    SET name = $1, is_main = $2, active = $3
    WHERE id = $4
    RETURNING id, name, is_main, active
  `,
    [name, isMain, active],
    id,
  );

  return rows[0];
};

export const disableCompany = async id => {
  const { rows } = await pool().query(
    `
    UPDATE companies
    SET active = false
    WHERE id = $1
    RETURNING id, name, is_main, active
    `,
    [id],
  );

  return rows[0];
};
