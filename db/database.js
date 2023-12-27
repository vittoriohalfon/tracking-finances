const { Pool } = require('pg');
require('dotenv').config();

// Set up your pool of connections here
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION,
});

module.exports = pool;
