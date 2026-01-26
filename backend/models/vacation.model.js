import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const getAllVacations = async onlyActive => {
  const { rows } = await pool().query(
    `
    SELECT v.id, v.worker_id, w.full_name AS full_name, v.start_date, v.end_date
    FROM vacations v
    INNER JOIN workers w ON v.worker_id = w.id
    WHERE ($1::BOOLEAN IS NULL OR w.active = $1)
    ORDER BY v.start_date DESC
    `,
    [onlyActive],
  );

  return rows;
};

export const getVacation = async id => {
  const { rows } = await pool().query(
    `
    SELECT v.id, v.worker_id, w.full_name AS full_name, v.start_date, v.end_date
    FROM vacations v
    INNER JOIN workers w ON v.worker_id = w.id
    WHERE v.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getWorkerVacations = async workerId => {
  const { rows } = await pool().query(
    `
    SELECT v.id, v.worker_id, w.full_name AS full_name, v.start_date, v.end_date
    FROM vacations v
    INNER JOIN workers w ON v.worker_id = w.id
    WHERE v.worker_id = $1
    `,
    [workerId],
  );

  return rows;
};

export const createVacation = async data => {
  try {
    const { workerId, startDate, endDate } = data;

    const { rows } = await pool().query(
      `
    INSERT INTO vacations (worker_id, start_date, end_date)
    VALUES ($1, $2, $3)
    RETURNING id, worker_id, start_date, end_date
  `,
      [workerId, startDate, endDate],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const updateVacation = async (id, data) => {
  try {
    const { workerId, startDate, endDate } = data;

    const { rows } = await pool().query(
      `
    UPDATE vacations
    SET worker_id = $1, start_date = $2, end_date = $3
    WHERE id = $4
    RETURNING id, worker_id, start_date, end_date
  `,
      [workerId, startDate, endDate, id],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const deleteVacation = async id => {
  const { rows } = await pool().query(
    `
    DELETE 
    FROM vacations
    WHERE id = $1
  `,
    [id],
  );

  return rows[0];
};
