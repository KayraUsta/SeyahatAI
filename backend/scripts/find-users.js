require('dotenv').config();
const { connectToDatabase } = require('../config/database');

async function findUsers() {
  try {
    await connectToDatabase();
    const pool = await connectToDatabase();
    const result = await pool.request().query('SELECT id, name, email FROM Users');
    console.log('👤 Users in database:');
    result.recordset.forEach(user => {
      console.log(`   - ${user.id}: ${user.name} (${user.email})`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

findUsers();
