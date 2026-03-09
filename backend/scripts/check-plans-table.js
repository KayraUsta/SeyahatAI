require('dotenv').config();
const { connectToDatabase } = require('../config/database');

async function checkPlansTable() {
  try {
    await connectToDatabase();
    const pool = await connectToDatabase();
    
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Plans' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📊 Plans table columns:');
    result.recordset.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    // Also check if there's any data
    const dataResult = await pool.request().query('SELECT COUNT(*) as count FROM Plans');
    console.log(`📈 Plans count: ${dataResult.recordset[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkPlansTable();
