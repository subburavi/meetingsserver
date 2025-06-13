const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'pretutors_user',
  host: process.env.PGHOST || 'dpg-d15qfvidbo4c73c3urn0-a.render.com',
  database: process.env.PGDATABASE || 'pretutors',
  password: process.env.PGPASSWORD || 'xbyurhm8BGugTPC17336zxuTsaecJmpg',
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
