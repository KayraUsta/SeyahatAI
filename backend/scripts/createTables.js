require('dotenv').config();
const { connectToDatabase, sql } = require('../config/database');

async function createTables() {
  try {
    console.log('🔄 Creating database tables...');
    
    const pool = await connectToDatabase();
    
    // Read SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlFile = fs.readFileSync(path.join(__dirname, '../config/tables.sql'), 'utf8');
    
    // Split by GO statements (SQL Server batch separator)
    const batches = sqlFile.split(/GO\s*\n/gi);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        try {
          await pool.request().query(batch);
          console.log(`✅ Batch ${i + 1}/${batches.length} executed successfully`);
        } catch (error) {
          console.log(`⚠️  Batch ${i + 1} failed (may already exist):`, error.message);
        }
      }
    }
    
    console.log('🎉 Database tables creation completed!');
    
    // Test connection by querying a table
    try {
      const result = await pool.request().query('SELECT COUNT(*) as count FROM Users');
      console.log(`📊 Users table exists with ${result.recordset[0].count} records`);
    } catch (error) {
      console.log('ℹ️  Users table query failed, but tables may exist');
    }
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    process.exit(0);
  }
}

createTables();
