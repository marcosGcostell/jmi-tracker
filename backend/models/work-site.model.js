import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const _assignUsers = async (client, workSiteId, userIds) => {
  const values = userIds.map((_, i) => `($1, $${i + 2})`).join(',');

  await client.query(
    `
    INSERT INTO user_work_sites (work_site_id, user_id)
    VALUES ${values}
    ON CONFLICT DO NOTHING
    `,
    [workSiteId, ...userIds],
  );
};

export const getAllWorkSites = async onlyActive => {
  const { rows } = await pool().query(
    `
    SELECT w.id, w.name, w.code, w.is_open, w.start_date, w.end_date,
    COALESCE(
      json_agg(
        json_build_object(
          'id', u.id,
          'full_name', u.full_name
        )
      ) FILTER (WHERE u.id IS NOT NULL),
      '[]'
    ) AS users
    FROM work_sites w
    LEFT JOIN user_work_sites uw ON uw.work_site_id = w.id
    LEFT JOIN users u ON u.id = uw.user_id 
    WHERE ($1::BOOLEAN IS NULL OR w.is_open = $1)
    GROUP BY w.id, w.name, w.code, w.is_open, w.start_date, w.end_date
    ORDER BY w.start_date DESC NULLS LAST, w.name ASC
    `,
    [onlyActive],
  );

  return rows;
};

export const getMyWorkSites = async (userId, onlyActive = null) => {
  const { rows } = await pool().query(
    `
    SELECT w.id, w.name, w.code, w.is_open, w.start_date, w.end_date,
    COALESCE(
      json_agg(
        json_build_object(
          'id', u.id,
          'full_name', u.full_name
        )
      ) FILTER (WHERE u.id IS NOT NULL),
      '[]'
    ) AS users
    FROM work_sites w
    LEFT JOIN user_work_sites uw ON uw.work_site_id = w.id
    LEFT JOIN users u ON u.id = uw.user_id 
    WHERE uw.user_id = $1 AND ($2::BOOLEAN IS NULL OR w.is_open = $2)
    GROUP BY w.id, w.name, w.code, w.is_open, w.start_date, w.end_date
    ORDER BY w.start_date DESC NULLS LAST, w.name ASC
    `,
    [userId, onlyActive],
  );

  return rows;
};

export const getWorkSite = async id => {
  const { rows } = await pool().query(
    `
    SELECT w.id, w.name, w.code, w.is_open, w.start_date, w.end_date,
    COALESCE(
      json_agg(
        json_build_object(
          'id', u.id,
          'full_name', u.full_name
        )
      ) FILTER (WHERE u.id IS NOT NULL),
      '[]'
    ) AS users
    FROM work_sites w
    LEFT JOIN user_work_sites uw ON uw.work_site_id = w.id
    LEFT JOIN users u ON u.id = uw.user_id 
    WHERE w.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getWorkSiteByCode = async id => {
  const { rows } = await pool().query(
    `
    SELECT w.id, w.name, w.code, w.is_open, w.start_date, w.end_date,
    COALESCE(
      json_agg(
        json_build_object(
          'id', u.id,
          'full_name', u.full_name
        )
      ) FILTER (WHERE u.id IS NOT NULL),
      '[]'
    ) AS users
    FROM work_sites w
    LEFT JOIN user_work_sites uw ON uw.work_site_id = w.id
    LEFT JOIN users u ON u.id = uw.user_id 
    WHERE w.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const createWorkSite = async (data, userIds) => {
  const client = await pool().connect();

  try {
    await client.query('BEGIN');

    const { name, code, startDate } = data;
    const { rows } = await client.query(
      `
    INSERT INTO work_sites (name, code, start_date)
    VALUES ($1, $2, $3)
    RETURNING id, name, code, is_open, start_date, end_date
  `,
      [name, code, startDate],
    );

    if (userIds?.length) {
      await _assignUsers(client, rows[0].id, userIds);
    }

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateWorkSite = async (id, data, userIds) => {
  const client = await pool().connect();

  try {
    await client.query('BEGIN');

    const { name, code, startDate, endDate } = data;
    const { rows } = await client.query(
      `
    UPDATE work_sites
    SET name = $1, code = $2, start_date = $3, end_date = $4
    WHERE id = $5
    RETURNING id, name, code, is_open, start_date, end_date
  `,
      [name, code, startDate, endDate, id],
    );

    // Delete all previous asigned users to this worksite
    await client.query(
      `
    DELETE
    FROM user_work_sites
    WHERE work_site_id = $1;
  `,
      [id],
    );

    // Reasign the new list
    if (userIds?.length) {
      await _assignUsers(client, rows[0].id, userIds);
    }

    await client.query('COMMIT');

    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
