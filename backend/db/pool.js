import pg from 'pg';
import AppError from '../utils/app-error.js';

const { Pool } = pg;
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
