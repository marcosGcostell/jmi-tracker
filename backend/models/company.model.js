import { getPool } from '../db/pool.js';

export const getAllCompanies = async (onlyActive, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT id, name, is_main, active
    FROM companies
    WHERE ($1::BOOLEAN IS NULL OR active = $1)
    ORDER BY is_main DESC NULLS LAST, name ASC
    `,
    [onlyActive],
  );

  return rows;
};

export const getCompany = async (id, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT id, name, is_main, active
    FROM companies
    WHERE id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getCompanyByName = async (name, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT id, name, is_main, active
    FROM companies
    WHERE name = $1
    `,
    [name],
  );

  return rows[0];
};

export const createCompany = async (data, client = getPool()) => {
  const { name } = data;

  const { rows } = await client.query(
    `
    INSERT INTO companies (name)
    VALUES ($1)
    RETURNING id, name, is_main, active
  `,
    [name],
  );

  return rows[0];
};

export const updateCompany = async (id, data, client = getPool()) => {
  const { name, isMain, active } = data;

  const { rows } = await client.query(
    `
    UPDATE companies
    SET name = $1, is_main = $2, active = $3
    WHERE id = $4
    RETURNING id, name, is_main, active
  `,
    [name, isMain, active, id],
  );

  return rows[0];
};

export const disableCompany = async (id, client = getPool()) => {
  const { rows } = await client.query(
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
