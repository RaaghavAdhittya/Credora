import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MySQL 8 Connection Pool configuration using mysql2/promise.
 * Credentials and database parameters are loaded via environment variables.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'apaar_verifier',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Verifies the database connection by acquiring and releasing a connection from the pool.
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(
      `[Database] Successfully connected to MySQL database: ${process.env.DB_NAME || 'apaar_verifier'} (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306})`
    );
    connection.release();
    return true;
  } catch (error) {
    console.error(`[Database] Connection verification failed: ${error.message}`);
    return false;
  }
}

export { pool, testConnection as verifyConnection };
export default pool;
