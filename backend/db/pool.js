import pg from 'pg';
import AppError from '../utils/app-error.js';

const { Pool, types } = pg;

// pg driver converts a postgres date stored as YYYY-MM-DD
// to a JavaScript Date Object, and express stringify in UTC+0
// in the response (big problem with UTC shift issues)
// With this, we set the parser for date type as it is
types.setTypeParser(1082, val => val); // 1082 = DATE

let pool;

export const initPool = () => {
  if (pool) return pool;

  console.log('Initializing database...');
  const isProduction = process.env.NODE_ENV === 'production';

  pool = new Pool({
    host: isProduction
      ? process.env.DB_DIRECT_HOST
      : process.env.DB_POOLER_HOST,
    port: Number(process.env.DB_PORT),
    user: isProduction
      ? process.env.DB_DIRECT_USER
      : process.env.DB_POOLER_USER,
    password: isProduction
      ? process.env.DB_DIRECT_PASSWORD
      : process.env.DB_POOLER_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  return pool;
};

export const getPool = () => {
  if (!pool) throw new AppError(400, 'La base de datos no se ha inicializado.');

  return pool;
};
