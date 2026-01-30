import { getPool } from '../db/pool.js';

export const findUserToLogIn = async (email, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT id, email, full_name, password, role, active
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  return rows[0];
};

export const findUserToAuth = async (id, client = getPool()) => {
  const { rows } = await client.query(
    `
    SELECT id, email, full_name, password, password_changed_at, role, active
    FROM users
    WHERE id = $1
    `,
    [id],
  );

  return rows[0];
};

export const findUserByResetCode = async (
  resetCodeHash,
  client = getPool(),
) => {
  const { rows } = await client.query(
    `
    SELECT id, email, full_name, role, active, reset_code_hash
    FROM users
    WHERE reset_code_hash = $1
      AND reset_code_expires > NOW()
    `,
    [resetCodeHash],
  );

  return rows[0];
};

export const saveResetCode = async (id, data, client = getPool()) => {
  const { resetCodeHash, expirationTime } = data;

  const { rows } = await client.query(
    `
    UPDATE users
    SET reset_code_hash = $1, reset_code_expires = NOW() + ($2 * INTERVAL '1 minute')
    WHERE id = $3
    RETURNING id, email, full_name, role
    `,
    [resetCodeHash, expirationTime, id],
  );

  return rows[0];
};

export const cleanResetCode = async (id, client = getPool()) => {
  const { rows } = await client.query(
    `
    UPDATE users
    SET reset_code_hash = NULL, reset_code_expires = NULL
    WHERE id = $1
    RETURNING id, email, full_name, role
    `,
    [id],
  );

  return rows[0];
};
