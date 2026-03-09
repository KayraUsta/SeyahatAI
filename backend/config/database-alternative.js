require('dotenv').config();
const sql = require('mssql');

// Alternative connection configurations for different scenarios
const connectionConfigs = {
  // Configuration 1: Standard TCP/IP
  standard: {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },

  // Configuration 2: Without encryption
  noEncryption: {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: false,
      trustServerCertificate: false,
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },

  // Configuration 3: Windows Authentication
  windowsAuth: {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      trustedConnection: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },

  // Configuration 4: With instance name
  withInstance: {
    server: process.env.DB_SERVER + '\\SQLEXPRESS',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  }
};

let pool;

async function connectToDatabase(configName = 'standard') {
  try {
    if (pool) {
      return pool;
    }

    const config = connectionConfigs[configName];
    console.log(`🔄 Trying to connect with configuration: ${configName}`);
    console.log(`📍 Server: ${config.server}:${config.port}`);
    console.log(`🗄️  Database: ${config.database}`);
    
    pool = await sql.connect(config);
    console.log('✅ MSSQL Server connected successfully');
    return pool;
    
  } catch (error) {
    console.error(`❌ Connection failed with ${configName}:`, error.message);
    
    // Try alternative configurations
    const configs = Object.keys(connectionConfigs);
    const currentIndex = configs.indexOf(configName);
    
    if (currentIndex < configs.length - 1) {
      const nextConfig = configs[currentIndex + 1];
      console.log(`🔄 Trying next configuration: ${nextConfig}`);
      return await connectToDatabase(nextConfig);
    }
    
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
  getConnection: () => pool,
  connectionConfigs
};
