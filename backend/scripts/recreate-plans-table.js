require('dotenv').config();
const { connectToDatabase } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function recreatePlansTable() {
  try {
    console.log('🔄 Recreating Plans table with new column names...');
    
    const pool = await connectToDatabase();
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '../config/recreate-plans-table.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by GO statements and execute each batch
    const batches = sqlContent.split(/\bGO\b/gi);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        try {
          await pool.request().query(batch);
          console.log(`✅ Batch ${i + 1}/${batches.length} executed successfully`);
        } catch (error) {
          console.log(`⚠️  Batch ${i + 1} failed:`, error.message);
        }
      }
    }
    
    console.log('🎉 Plans table recreation completed!');
    
    // Verify the new table structure
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Plans' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📊 New Plans table columns:');
    result.recordset.forEach(col => {
      console.log(`   ✅ ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
  } catch (error) {
    console.error('❌ Recreation failed:', error);
  } finally {
    process.exit(0);
  }
}

recreatePlansTable();
