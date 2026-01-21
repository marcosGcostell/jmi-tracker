import app from './app.js';
import { initPool } from './db/pool.js';

const port = process.env.NODE_ENV === 'production' ? 3000 : process.env.PORT;
app.listen(port, 'localhost', () => {
  console.log(`App running on port ${port}...`);
});

try {
  const pool = initPool();

  await pool.query('select 1');
  console.log('Connection to Database successfully...');
} catch (err) {
  console.log('Something went wrong connecting to the database...');
}
