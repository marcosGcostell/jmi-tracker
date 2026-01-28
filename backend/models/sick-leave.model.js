import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const getAllSickLeaves = async (onlyActive, period) => {
  const periodCondition = period
    ? ` AND s.start_date <= $2 AND (s.end_date IS NULL OR s.end_date >= $3)`
    : '';
  const values = [onlyActive];
  if (period) values.push(period.to, period.from);

  const sql = `
    SELECT s.id, s.resource_id, r.name AS name, s.start_date, s.end_date
    FROM sick_leaves s
    INNER JOIN resources r ON s.resource_id = r.id
    WHERE ($1::BOOLEAN IS NULL OR r.active = $1)${periodCondition}
    ORDER BY s.start_date DESC
    `;

  const { rows } = await pool().query(sql, values);

  return rows;
};

export const getSickLeave = async id => {
  const { rows } = await pool().query(
    `
    SELECT s.id, s.resource_id, r.name AS name, s.start_date, s.end_date
    FROM sick_leaves s
    INNER JOIN resources r ON s.resource_id = r.id
    WHERE s.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getWorkerSickLeaves = async (resourceId, period) => {
  const periodCondition = period
    ? ` AND s.start_date <= $2 AND (s.end_date IS NULL OR s.end_date >= $3)`
    : '';
  const values = [resourceId];
  if (period) values.push(period.to, period.from);

  const sql = `
    SELECT s.id, s.resource_id, r.name AS name, s.start_date, s.end_date
    FROM sick_leaves s
    INNER JOIN resources r ON s.resource_id = r.id
    WHERE s.resource_id = $1${periodCondition}
    `;

  const { rows } = await pool().query(sql, values);

  return rows;
};

export const createSickLeave = async data => {
  try {
    const { resourceId, startDate, endDate } = data;

    const { rows } = await pool().query(
      `
    INSERT INTO sick_leaves (resource_id, start_date, end_date)
    VALUES ($1, $2, $3)
    RETURNING id, resource_id, start_date, end_date
  `,
      [resourceId, startDate, endDate],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const updateSickLeave = async (id, data) => {
  try {
    const { resourceId, startDate, endDate } = data;

    const { rows } = await pool().query(
      `
    UPDATE sick_leaves
    SET resource_id = $1, start_date = $2, end_date = $3
    WHERE id = $4
    RETURNING id, resource_id, start_date, end_date
  `,
      [resourceId, startDate, endDate, id],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const deleteSickLeave = async id => {
  const client = await pool().connect();
  try {
    const { rowCount, rows } = await client.query(
      `
    DELETE 
    FROM sick_leaves
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
