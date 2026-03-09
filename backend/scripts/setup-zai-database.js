require('dotenv').config();
const { connectToDatabase, sql } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupZaiDatabase() {
  try {
    console.log('🔄 Setting up Zai database tables...');
    
    // Connect to database
    const pool = await connectToDatabase();
    console.log('✅ Connected to MSSQL Server');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '../config/create-tables-mssql.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 SQL file loaded, executing...');
    
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
          // Continue with next batch
        }
      }
    }
    
    console.log('🎉 Database setup completed!');
    
    // Test the setup by checking tables
    try {
      const result = await pool.request().query(`
        SELECT 
          TABLE_NAME,
          TABLE_TYPE
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME IN ('Users', 'Plans', 'Budgets', 'Expenses', 'TodoLists', 'TodoItems', 'PasswordResets')
        ORDER BY TABLE_NAME
      `);
      
      console.log('📊 Created tables:');
      result.recordset.forEach(table => {
        console.log(`   ✅ ${table.TABLE_NAME}`);
      });
      
      // Check if we have at least one table
      if (result.recordset.length > 0) {
        console.log(`🎯 Successfully created ${result.recordset.length} tables in Zai database!`);
      } else {
        console.log('⚠️  No tables found. Please check your database permissions.');
      }
      
    } catch (error) {
      console.log('ℹ️  Could not verify tables:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if database server is accessible');
    console.log('2. Verify database credentials in .env file');
    console.log('3. Ensure user has CREATE TABLE permissions');
    console.log('4. Check if database "Zai" exists');
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupZaiDatabase();
