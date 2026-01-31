import { getPool } from '../db/pool.js';

export const getAllResources = async (onlyActive, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT r.id, r.name, r.resource_type, r.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company,
      json_build_object(
        'id', g.id,
        'name', g.name
      ) AS category
    FROM resources r
    LEFT JOIN companies c ON r.company_id = c.id
    LEFT JOIN categories g ON r.category_id = g.id
    WHERE ($1::BOOLEAN IS NULL OR r.active = $1)
    ORDER BY c.is_main DESC NULLS LAST, c.name ASC, r.active DESC, r.name ASC
    `,
    [onlyActive],
  );

  return rows;
};

export const getResource = async (id, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT r.id, r.name, r.user_id, r.resource_type, r.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company,
      json_build_object(
        'id', g.id,
        'name', g.name
      ) AS category
    FROM resources r
    LEFT JOIN companies c ON r.company_id = c.id
    LEFT JOIN categories g ON r.category_id = g.id
    WHERE r.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getCompanyResources = async (
  companyId,
  onlyActive,
  client = getPool(),
) => {
  const { rows } = await client.query(
    `
    SELECT r.id, r.name, r.resource_type, r.active, c.name AS company,
      json_build_object(
        'id', g.id,
        'name', g.name
      ) AS category
    FROM resources r
    INNER JOIN companies c ON r.company_id = c.id
    LEFT JOIN categories g ON r.category_id = g.id
    WHERE r.company_id = $1
      AND ($2::BOOLEAN IS NULL OR r.active = $2)
    ORDER BY r.active DESC, r.name ASC
    `,
    [companyId, onlyActive],
  );

  return rows;
};

export const getCompanyResourcesWithStatus = async (
  companyId,
  onlyActive,
  date,
  client = getPool(),
) => {
  const { rows } = await client.query(
    `
    SELECT r.id, r.name, r.resource_type, r.active, c.name AS company,
      json_build_object(
        'id', g.id,
        'name', g.name
      ) AS category
    FROM resources r
    INNER JOIN companies c ON r.company_id = c.id
    LEFT JOIN categories g ON r.category_id = g.id
    LEFT JOIN vacations v
      ON v.resource_id = r.id
      AND $1 BETWEEN v.start_date AND v.end_date
    LEFT JOIN sick_leaves l
      ON l.resource_id = r.id
      AND $1 BETWEEN l.start_date AND l.end_date
    WHERE r.company_id = $2
      AND ($3::BOOLEAN IS NULL OR r.active = $3)
    ORDER BY r.active DESC, r.name ASC
    `,
    [date, companyId, onlyActive],
  );

  return rows;
};

export const findResource = async (companyId, name, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT r.id, r.name, r.resource_type, r.active, c.name AS company,
      json_build_object(
        'id', g.id,
        'name', g.name
      ) AS category
    FROM resources r
    INNER JOIN companies c ON r.company_id = c.id
    LEFT JOIN categories g ON r.category_id = g.id
    WHERE r.company_id = $1 AND r.name = $2
    `,
    [companyId, name],
  );

  return rows[0];
};

export const getResourcesWithCategory = async (
  categoryId,
  client = getPool(),
) => {
  const { rows } = await client.query(
    `
    SELECT r.id
    FROM resources r
    INNER JOIN companies c ON r.company_id = c.id
    LEFT JOIN categories g ON r.category_id = g.id
    WHERE r.category_id = $1
    `,
    [categoryId],
  );

  return rows;
};

export const createResource = async (data, client = getPool()) => {
  const { companyId, categoryId, name, resourceType } = data;

  const { rows } = await client.query(
    `
    WITH new_resource AS (
      INSERT INTO resources (company_id, category_id, name, resource_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, company_id, category_id, name, resource_type, active
    )
    SELECT nr.id, nr.name, nr.resource_type, nr.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company,
      json_build_object(
        'id', g.id,
        'name', g.name
      ) AS category
    FROM new_resource nr
    JOIN companies c ON c.id = nr.company_id
    JOIN categories g ON g.id = nr.category_id
  `,
    [companyId, categoryId, name, resourceType],
  );

  return rows[0];
};

export const updateResource = async (id, data, client = getPool()) => {
  const { name, userId, companyId, categoryId, resourceType, active } = data;

  const { rows } = await client.query(
    `
    WITH updated_resource AS (
      UPDATE resources
      SET name = $1, user_id = $2, company_id=$3, category_id=$4, resource_type=$5, active = $6
      WHERE id = $7
      RETURNING id, company_id, category_id, name, resource_type, active
    )
    SELECT ur.id, ur.name, ur.resource_type, ur.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company,
      json_build_object(
        'id', g.id,
        'name', g.name
      ) AS category
    FROM updated_resource ur
    JOIN companies c ON c.id = ur.company_id
    JOIN categories g ON g.id = ur.category_id
  `,
    [name, userId, companyId, categoryId, resourceType, active, id],
  );

  return rows[0];
};

export const disableResource = async (id, client = getPool()) => {
  const { rows } = await client.query(
    `
    WITH updated_resource AS (
      UPDATE resources
      SET active = false
      WHERE id = $1
      RETURNING id, company_id, category_id, name, resource_type, active
    )
    SELECT ur.id, ur.name, ur.resource_type, ur.active,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company,
      json_build_object(
        'id', g.id,
        'name', g.name
      ) AS category
    FROM updated_resource ur
    JOIN companies c ON c.id = ur.company_id
    JOIN categories g ON g.id = ur.category_id
    `,
    [id],
  );

  return rows[0];
};
