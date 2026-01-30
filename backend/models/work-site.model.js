import { getPool } from '../db/pool.js';

const _assignUsers = async (workSiteId, userIds, client) => {
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

const _getFullWorkSite = async (workSiteId, client) => {
  const { rows } = await client.query(
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
    GROUP BY w.id
    `,
    [workSiteId],
  );

  return rows[0];
};

export const getAllWorkSites = async (onlyActive, client = getPool()) => {
  const { rows } = await client.query(
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

export const findMyWorkSites = async (
  userId,
  onlyActive = null,
  client = getPool(),
) => {
  const { rows } = await client.query(
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

export const getWorkSite = async (id, client = getPool()) =>
  _getFullWorkSite(id, client);

export const getWorkSiteByCode = async (code, client = getPool()) => {
  const { rows } = await client.query(
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
    WHERE w.code = $1
    GROUP BY w.id
    `,
    [code],
  );

  return rows[0];
};

export const createWorkSite = async (data, userIds, client = getPool()) => {
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
    await _assignUsers(rows[0].id, userIds, client);
  }

  return _getFullWorkSite(rows[0].id, client);
};

export const updateWorkSite = async (id, data, userIds, client = getPool()) => {
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

  if (userIds !== undefined && userIds !== null) {
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
      await _assignUsers(rows[0].id, userIds, client);
    }
  }

  return _getFullWorkSite(rows[0].id, client);
};
