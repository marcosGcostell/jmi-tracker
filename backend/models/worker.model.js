import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const getAllWorkers = async () => {
  const { rows } = await pool().query(`
    SELECT w.id, w.full_name, w.active,
    json_build_object(
      'id', c.id,
      'name', c.name
    ) AS company
    FROM workers w
    LEFT JOIN companies c ON w.company_id = c.id
    ORDER BY c.is_main DESC NULLS LAST, c.name ASC, w.full_name ASC
    `);

  return rows;
};

export const getWorker = async id => {
  const { rows } = await pool().query(
    `
    SELECT w.id, w.full_name, w.active,
    json_build_object(
      'id', c.id,
      'name', c.name
    ) AS company
    FROM workers w
    LEFT JOIN companies c ON w.company_id = c.id
    WHERE w.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getWorkersFromCompany = async companyId => {
  const { rows } = await pool().query(
    `
    SELECT w.id, w.full_name, w.active,
    json_build_object(
      'id', c.id,
      'name', c.name
    ) AS company
    FROM workers w
    INNER JOIN companies c ON w.company_id = c.id
    WHERE w.company_id = $1
    ORDER BY w.full_name ASC
    `,
    [companyId],
  );

  return rows;
};

export const findWorker = async (companyId, fullName) => {
  const { rows } = await pool().query(
    `
    SELECT id, full_name, active,
    FROM workers
    WHERE w.company_id = $1 AND full_name = $2
    `,
    [companyId, fullName],
  );

  return rows[0];
};

export const createWorker = async data => {
  const { companyId, fullName } = data;

  const { rows } = await pool().query(
    `
    WITH new_worker AS (
      INSERT INTO workers (company_id, full_name)
      VALUES ($1, $2)
      RETURNING id, company_id, full_name, active
    )
    SELECT nw.id, nw.full_name, nw.active,
    json_build_object(
      'id', c.id,
      'name', c.name
    ) AS company
    FROM new_worker nw
    JOIN companies c ON c.id = nw.company_id
  `,
    [companyId, fullName],
  );

  return rows[0];
};

export const updateWorker = async (id, data) => {
  const { fullName, userId, companyId, active } = data;

  const { rows } = await pool().query(
    `
    WITH updated_worker AS (
      UPDATE workers
      SET full_name = $1, user_id = $2, company_id=$3, active = $4
      WHERE id = $5
      RETURNING id, company_id, full_name, active
    )
    SELECT uw.id, uw.full_name, uw.active,
    json_build_object(
      'id', c.id,
      'name', c.name
    ) AS company
    FROM updated_worker uw
    JOIN companies c ON c.id = uw.company_id
  `,
    [fullName, userId, companyId, active, id],
  );

  return rows[0];
};

export const disableWorker = async id => {
  const { rows } = await pool().query(
    `
    WITH updated_worker AS (
      UPDATE workers
      SET active = false
      WHERE id = $1
      RETURNING id, company_id, full_name, active
    )
    SELECT uw.id, uw.full_name, uw.active,
    json_build_object(
      'id', c.id,
      'name', c.name
    ) AS company
    FROM updated_worker uw
    JOIN companies c ON c.id = uw.company_id
    `,
    [id],
  );

  return rows[0];
};
