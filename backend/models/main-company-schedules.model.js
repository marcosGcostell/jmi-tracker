import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const getAllSchedules = async (onlyActive, period) => {
  const periodCondition = period
    ? ` AND s.valid_from <= $2 AND (s.valid_to IS NULL OR s.valid_to >= $3)`
    : '';
  const values = [onlyActive];
  if (period) values.push(period.to, period.from);

  const sql = `
    SELECT s.id, s.start_time, s.end_time, s.day_correction_minutes, s.valid_from, s.valid_to,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company,
    FROM main_company_schedules s
    LEFT JOIN companies c ON s.company_id = c.id
    WHERE ($1::BOOLEAN IS NULL OR c.active = $1)${periodCondition}
    ORDER BY s.start_time DESC
    `;

  const { rows } = await pool().query(sql, values);

  return rows;
};

export const getSchedule = async id => {
  const { rows } = await pool().query(
    `
    SELECT s.id, s.start_time, s.end_time, s.day_correction_minutes, s.valid_from, s.valid_to,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company,
    FROM main_company_schedules s
    LEFT JOIN companies c ON s.company_id = c.id
    WHERE s.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getCompanySchedules = async (companyId, period) => {
  const periodCondition = period
    ? ` AND s.start_time <= $2 AND (s.end_time IS NULL OR s.end_time >= $3)`
    : '';
  const values = [companyId];
  if (period) values.push(period.to, period.from);

  const sql = `
    SELECT s.id, s.start_time, s.end_time, s.day_correction_minutes, s.valid_from, s.valid_to,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company,
    FROM main_company_schedules s
    LEFT JOIN companies c ON s.company_id = c.id
    WHERE s.company_id = $1${periodCondition}
    `;

  const { rows } = await pool().query(sql, values);

  return rows;
};

export const createSchedule = async data => {
  try {
    const { companyId, startTime, endTime, dayCorrection, validFrom, validTo } =
      data;

    const { rows } = await pool().query(
      `
    INSERT INTO main_company_schedules (company_id, start_time, end_time, day_correction_minutes, valid_from, valid_to)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, company_id, start_time, end_time, day_correction_minutes, valid_from, valid_to
  `,
      [companyId, startTime, endTime, dayCorrection, validFrom, validTo],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const updateSchedule = async (id, data) => {
  try {
    const { companyId, startTime, endTime, dayCorrection, validFrom, validTo } =
      data;

    const { rows } = await pool().query(
      `
    UPDATE main_company_schedules
    SET company_id = $1, start_time = $2, end_time = $3, day_correction_minutes = $4, valid_from = $5, valid_to = $6
    WHERE id = $7
    RETURNING id, company_id, start_time, end_time, day_correction_minutes, valid_from, valid_to
  `,
      [companyId, startTime, endTime, dayCorrection, validFrom, validTo, id],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const deleteSchedule = async id => {
  const client = await pool().connect();
  try {
    const { rowCount, rows } = await client.query(
      `
    DELETE 
    FROM main_company_schedules
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
