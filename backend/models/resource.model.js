import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const getAllResources = async onlyActive => {
  const { rows } = await pool().query(
    `
    SELECT r.id, r.full_name, r.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company
    FROM resources r
    LEFT JOIN companies c ON r.company_id = c.id
    WHERE ($1::BOOLEAN IS NULL OR r.active = $1)
    ORDER BY c.is_main DESC NULLS LAST, c.name ASC, r.active DESC, r.full_name ASC
    `,
    [onlyActive],
  );

  return rows;
};

export const getResource = async id => {
  const { rows } = await pool().query(
    `
    SELECT r.id, r.full_name, r.user_id, r.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company
    FROM resources r
    LEFT JOIN companies c ON r.company_id = c.id
    WHERE r.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getCompanyResources = async (companyId, onlyActive) => {
  const { rows } = await pool().query(
    `
    SELECT r.id, r.full_name, r.active, c.name AS company
    FROM resources r
    INNER JOIN companies c ON r.company_id = c.id
    WHERE r.company_id = $1
      AND ($2::BOOLEAN IS NULL OR r.active = $2)
    ORDER BY r.active DESC, r.full_name ASC
    `,
    [companyId, onlyActive],
  );

  return rows;
};

export const getCompanyResourcesWithStatus = async (
  companyId,
  onlyActive,
  date,
) => {
  const { rows } = await pool().query(
    `
    SELECT r.id, r.full_name, r.active, c.name AS company
    FROM resources r
    INNER JOIN companies c ON r.company_id = c.id
    LEFT JOIN vacations v
      ON v.resource_id = r.id
      AND $1 BETWEEN v.start_date AND v.end_date
    LEFT JOIN sick_leaves l
      ON l.resource_id = r.id
      AND $1 BETWEEN l.start_date AND l.end_date
    WHERE r.company_id = $2
      AND ($3::BOOLEAN IS NULL OR r.active = $3)
    ORDER BY r.active DESC, r.full_name ASC
    `,
    [date, companyId, onlyActive],
  );

  return rows;
};

export const findResource = async (companyId, fullName) => {
  const { rows } = await pool().query(
    `
    SELECT r.id, r.full_name, r.active, c.name AS company
    FROM resources r
    INNER JOIN companies c ON r.company_id = c.id
    WHERE r.company_id = $1 AND r.full_name = $2
    `,
    [companyId, fullName],
  );

  return rows[0];
};

export const createResource = async data => {
  const { companyId, fullName } = data;

  const { rows } = await pool().query(
    `
    WITH new_resource AS (
      INSERT INTO resources (company_id, full_name)
      VALUES ($1, $2)
      RETURNING id, company_id, full_name, active
    )
    SELECT nr.id, nr.full_name, nr.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company
    FROM new_resource nr
    JOIN companies c ON c.id = nr.company_id
  `,
    [companyId, fullName],
  );

  return rows[0];
};

export const updateResource = async (id, data) => {
  const { fullName, userId, companyId, active } = data;

  const { rows } = await pool().query(
    `
    WITH updated_resource AS (
      UPDATE resources
      SET full_name = $1, user_id = $2, company_id=$3, active = $4
      WHERE id = $5
      RETURNING id, company_id, full_name, active
    )
    SELECT ur.id, ur.full_name, ur.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company
    FROM updated_resource ur
    JOIN companies c ON c.id = ur.company_id
  `,
    [fullName, userId, companyId, active, id],
  );

  return rows[0];
};

export const disableResource = async id => {
  const { rows } = await pool().query(
    `
    WITH updated_resource AS (
      UPDATE resources
      SET active = false
      WHERE id = $1
      RETURNING id, company_id, full_name, active
    )
    SELECT ur.id, ur.full_name, ur.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company
    FROM updated_resource ur
    JOIN companies c ON c.id = ur.company_id
    `,
    [id],
  );

  return rows[0];
};
