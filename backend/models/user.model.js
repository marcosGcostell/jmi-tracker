import { getPool } from '../db/pool.js';

const pool = () => getPool();

export const getAllUsers = async () => {
  const { rows } = await pool().query(`
    SELECT id, email, full_name, role
    FROM users
    ORDER BY created_at DESC
    `);

  return rows;
};

export const getUser = async id => {
  const { rows } = await pool().query(
    `
    SELECT id, email, full_name, role
    FROM users
    WHERE id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getUserByEmail = async email => {
  const { rows } = await pool().query(
    `
    SELECT id, email, full_name, role
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  return rows[0];
};

export const createUser = async data => {
  const { email, fullName, passwordHash, role } = data;

  const { rows } = await pool().query(
    `
    INSERT INTO users (email, full_name, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, full_name, role
  `,
    [email, fullName, passwordHash, role],
  );

  return rows[0];
};

export const updateUser = async (id, data) => {
  const { email, fullName, role, active } = data;

  const { rows } = await pool().query(
    `
    UPDATE users
    SET email = $1, full_name = $2, role = $3, active = $4
    WHERE id = $5
    RETURNING id, email, full_name, role
    `,
    [email, fullName, role, active, id],
  );

  return rows[0];
};

export const updateUserPassword = async (id, passwordHash) => {
  const { rows } = await pool().query(
    `
    UPDATE users
    SET password = $1, password_changed_at = NOW() - INTERVAL '1 second'
    WHERE id = $2
    RETURNING id, email, full_name, role
    `,
    [passwordHash, id],
  );

  return rows[0];
};

export const disableUser = async id => {
  const { rows } = await pool().query(
    `
    UPDATE users
    SET active = false
    WHERE id = $1
    RETURNING id, email, full_name, role
    `,
    [id],
  );

  return rows[0];
};
