const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'building_materials_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  charset: 'utf8mb4'
});

// Test connection helper
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected successfully to MySQL database:', process.env.DB_NAME || 'building_materials_db');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:');
    console.error(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.error(`   Database: ${process.env.DB_NAME}`);
    console.error(`   Error message: ${error.message}`);
    console.error('👉 Make sure MySQL is running in XAMPP and "building_materials_db" is created.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
