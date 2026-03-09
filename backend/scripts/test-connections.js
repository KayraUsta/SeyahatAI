require('dotenv').config();

// Test different connection configurations
const configs = [
  {
    name: 'Standard TCP/IP',
    config: {
      server: process.env.DB_SERVER,
      port: parseInt(process.env.DB_PORT) || 1433,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    }
  },
  {
    name: 'No Encryption',
    config: {
      server: process.env.DB_SERVER,
      port: parseInt(process.env.DB_PORT) || 1433,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: false,
        trustServerCertificate: false,
        enableArithAbort: true
      }
    }
  },
  {
    name: 'Windows Authentication',
    config: {
      server: process.env.DB_SERVER,
      port: parseInt(process.env.DB_PORT) || 1433,
      database: process.env.DB_DATABASE,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        trustedConnection: true
      }
    }
  }
];

const sql = require('mssql');

async function testConnections() {
  console.log('🔍 Testing MSSQL connection configurations...\n');
  
  for (const { name, config } of configs) {
    console.log(`🔄 Testing: ${name}`);
    console.log(`   Server: ${config.server}:${config.port || 1433}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user || 'Windows Auth'}`);
    
    try {
      const pool = await sql.connect(config);
      
      // Test query
      const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as current_db');
      
      console.log(`   ✅ SUCCESS!`);
      console.log(`   📊 SQL Server: ${result.recordset[0].version.split('\n')[0]}`);
      console.log(`   🗄️  Database: ${result.recordset[0].current_db}`);
      
      // Check if tables exist
      try {
        const tablesResult = await pool.request().query(`
          SELECT COUNT(*) as table_count 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_TYPE = 'BASE TABLE'
        `);
        console.log(`   📋 Existing tables: ${tablesResult.recordset[0].table_count}`);
      } catch (tableError) {
        console.log(`   ⚠️  Could not check tables: ${tableError.message}`);
      }
      
      await pool.close();
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🔧 Connection Test Summary:');
  console.log('1. If any configuration succeeded, update config/database.js');
  console.log('2. If all failed, check:');
  console.log('   - Server address and port');
  console.log('   - Username and password');
  console.log('   - Database name');
  console.log('   - Network connectivity');
  console.log('   - Firewall settings');
  console.log('3. Use MANUALSETUP.md for manual table creation');
}

testConnections().catch(console.error);
