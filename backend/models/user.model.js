import { getPool } from '../db/pool.js';

export const getAllUsers = async (client = getPool()) => {
  const { rows } = await client.query(`
    SELECT id, email, full_name, role, active
    FROM users
    ORDER BY role ASC, full_name ASC
    `);

  return rows;
};

export const getUser = async (id, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT id, email, full_name, role, active
    FROM users
    WHERE id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getUserByEmail = async (email, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT id, email, full_name, role, active
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  return rows[0];
};

export const createUser = async (data, client = getPool()) => {
  const { email, fullName, passwordHash, role } = data;

  const { rows } = await client.query(
    `
    INSERT INTO users (email, full_name, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, full_name, role, active
  `,
    [email, fullName, passwordHash, role],
  );

  return rows[0];
};

export const updateUser = async (id, data, client = getPool()) => {
  const { email, fullName, role, active } = data;

  const { rows } = await client.query(
    `
    UPDATE users
    SET email = $1, full_name = $2, role = $3, active = $4
    WHERE id = $5
    RETURNING id, email, full_name, role, active
    `,
    [email, fullName, role, active, id],
  );

  return rows[0];
};

export const updateUserPassword = async (
  id,
  passwordHash,
  client = getPool(),
) => {
  const { rows } = await client.query(
    `
    UPDATE users
    SET password = $1, password_changed_at = NOW() - INTERVAL '1 second'
    WHERE id = $2
    RETURNING id, email, full_name, role, active
    `,
    [passwordHash, id],
  );

  return rows[0];
};

export const disableUser = async (id, client = getPool()) => {
  const { rows } = await client.query(
    `
    UPDATE users
    SET active = false
    WHERE id = $1
    RETURNING id, email, full_name, role, active
    `,
    [id],
  );

  return rows[0];
};
