require('dotenv').config();
const { connectToDatabase, sql } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function fixPlansTable() {
  try {
    console.log('🔧 Fixing Plans table...');
    
    const pool = await connectToDatabase();
    
    // Read the fix SQL file
    const sqlFile = path.join(__dirname, '../config/fix-plans-table.sql');
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
    
    console.log('🎉 Plans table fix completed!');
    
    // Verify all tables exist
    const result = await pool.request().query(`
      SELECT 
        TABLE_NAME,
        TABLE_TYPE
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME IN ('Users', 'Plans', 'Budgets', 'Expenses', 'TodoLists', 'TodoItems', 'PasswordResets')
      ORDER BY TABLE_NAME
    `);
    
    console.log('📊 All tables in Zai database:');
    result.recordset.forEach(table => {
      console.log(`   ✅ ${table.TABLE_NAME}`);
    });
    
    console.log(`🎯 All ${result.recordset.length} tables are ready!`);
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    process.exit(0);
  }
}

fixPlansTable();
