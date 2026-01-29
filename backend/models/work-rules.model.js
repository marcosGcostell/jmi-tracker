import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const getAllWorkRules = async (onlyActive, period) => {
  const periodCondition = period
    ? ` AND r.valid_from <= $2 AND (r.valid_to IS NULL OR r.valid_to >= $3)`
    : '';
  const values = [onlyActive];
  if (period) values.push(period.to, period.from);

  const sql = `
    SELECT r.id, r.day_correction_minutes, r.valid_from, r.valid_to,
      json_build_object(
        'id', w.id,
        'name', w.name
      ) AS work_site,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company
    FROM work_site_company_rules r
    LEFT JOIN work_sites w ON r.work_site_id = w.id
    LEFT JOIN companies c ON r.company_id = c.id
    WHERE ($1::BOOLEAN IS NULL OR c.active = $1)${periodCondition}
    ORDER BY r.start_time DESC
    `;

  const { rows } = await pool().query(sql, values);

  return rows;
};

export const getWorkRule = async id => {
  const { rows } = await pool().query(
    `
    SELECT r.id, r.day_correction_minutes, r.valid_from, r.valid_to,
      json_build_object(
        'id', w.id,
        'name', w.name
      ) AS work_site,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company
    FROM work_site_company_rules r
    LEFT JOIN work_sites w ON r.work_site_id = w.id
    LEFT JOIN companies c ON r.company_id = c.id
    WHERE r.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getWorkSiteWorkRules = async (workSiteId, period) => {
  const periodCondition = period
    ? ` AND s.valid_from <= $2 AND (s.valid_to IS NULL OR s.valid_to >= $3)`
    : '';
  const values = [workSiteId];
  if (period) values.push(period.to, period.from);

  const sql = `
    SELECT r.id, r.day_correction_minutes, r.valid_from, r.valid_to,
      json_build_object(
        'id', w.id,
        'name', w.name
      ) AS work_site,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company
    FROM work_site_company_rules r
    LEFT JOIN work_sites w ON r.work_site_id = w.id
    LEFT JOIN companies c ON r.company_id = c.id
    WHERE r.work_site_id = $1${periodCondition}
    `;

  const { rows } = await pool().query(sql, values);

  return rows;
};

export const getWorkSiteAndCompanyWorkRules = async (
  workSiteId,
  companyId,
  period,
) => {
  const periodCondition = period
    ? ` AND s.valid_from <= $2 AND (s.valid_to IS NULL OR s.valid_to >= $3)`
    : '';
  const values = [workSiteId, companyId];
  if (period) values.push(period.to, period.from);

  const sql = `
    SELECT r.id, r.day_correction_minutes, r.valid_from, r.valid_to,
      json_build_object(
        'id', w.id,
        'name', w.name
      ) AS work_site,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS company
    FROM work_site_company_rules r
    LEFT JOIN work_sites w ON r.work_site_id = w.id
    LEFT JOIN companies c ON r.company_id = c.id
    WHERE r.work_site_id = $1 AND r.company_id=$2${periodCondition}
    `;

  const { rows } = await pool().query(sql, values);

  return rows;
};

export const createWorkRule = async data => {
  try {
    const { workSiteId, companyId, dayCorrection, validFrom, validTo } = data;

    const { rows } = await pool().query(
      `
    INSERT INTO work_site_company_rules (work_site_id, company_id, day_correction_minutes, valid_from, valid_to)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, work_site_id, company_id, day_correction_minutes, valid_from, valid_to
  `,
      [workSiteId, companyId, dayCorrection, validFrom, validTo],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const updateWorkRule = async (id, data) => {
  try {
    const { workSiteId, companyId, dayCorrection, validFrom, validTo } = data;

    const { rows } = await pool().query(
      `
    UPDATE work_site_company_rules
    SET work_site_id= $1, company_id = $2, day_correction_minutes = $3, valid_from = $4, valid_to = $5
    WHERE id = $6
    RETURNING id, work_site_id, company_id, day_correction_minutes, valid_from, valid_to
  `,
      [workSiteId, companyId, dayCorrection, validFrom, validTo, id],
    );

    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const deleteWorkRule = async id => {
  const client = await pool().connect();
  try {
    const { rowCount, rows } = await client.query(
      `
    DELETE 
    FROM work_site_company_rules
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
