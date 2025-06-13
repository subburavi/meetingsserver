const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'tutorshub',
  password: process.env.PGPASSWORD || 'subburavi',
  port: process.env.PGPORT || 5432,
});

// Test the connection
pool.connect()
  .then(client => {
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ Error connecting to PostgreSQL:', err.stack);
  });

module.exports = pool;
