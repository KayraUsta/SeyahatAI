require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true, // Windows Azure için gerekli
    trustServerCertificate: true, // Geliştirme için
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function connectToDatabase() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('✅ MSSQL Server connected successfully');
    }
    return pool;
  } catch (error) {
    console.error('❌ MSSQL connection error:', error);
    throw error;
  }
}

async function closeConnection() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ MSSQL connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MSSQL connection:', error);
  }
}

module.exports = {
  sql,
  connectToDatabase,
  closeConnection,
  getConnection: () => pool
};
