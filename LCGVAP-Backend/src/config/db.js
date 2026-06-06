const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? {
      connectionString,

      max:                     parseInt(process.env.DB_POOL_MAX || '10', 10),
      min:                     parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis:       parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '5000', 10),
      statement_timeout:       parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '7000', 10),
      query_timeout:           parseInt(process.env.DB_QUERY_TIMEOUT_MS || '7000', 10),
      keepAlive:               true,
    }
  : {
      host:                    process.env.DB_HOST,
      port:                    process.env.DB_PORT,
      database:                process.env.DB_NAME,
      user:                    process.env.DB_USER,
      password:                process.env.DB_PASSWORD,

      max:                     parseInt(process.env.DB_POOL_MAX || '10', 10),
      min:                     parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis:       parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '5000', 10),
      statement_timeout:       parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '7000', 10),
      query_timeout:           parseInt(process.env.DB_QUERY_TIMEOUT_MS || '7000', 10),
      keepAlive:               true,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err.message);
});

module.exports = pool;
