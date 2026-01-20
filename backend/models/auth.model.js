import pool from '../db/pool.js';

export const findUserToLogIn = async email => {
  const { rows } = await pool.query(
    `
    SELECT id, email, full_name, password, role, active
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  return rows[0];
};

export const findUserToAuth = async id => {
  const { rows } = await pool.query(
    `
    SELECT id, email, full_name, password, role, active
    FROM users
    WHERE id = $1
    `,
    [id],
  );

  return rows[0];
};
