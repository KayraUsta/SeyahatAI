require('dotenv').config();
const { connectToDatabase } = require('../config/database');
const Plan = require('../models/mssql/Plan');
const jwt = require('jsonwebtoken');

async function testPlansAPI() {
  try {
    console.log('🔄 Testing Plans API...');
    
    // Connect to database
    await connectToDatabase();
    console.log('✅ Database connected');
    
    // Test with a sample user ID (the one we created)
    const userId = '6E9FCF16-D900-4034-A0DC-A63D5954E9FD';
    console.log(`👤 Testing with user ID: ${userId}`);
    
    // Test Plan.findByUserId
    try {
      const plans = await Plan.findByUserId(userId);
      console.log(`✅ findByUserId success: Found ${plans.length} plans`);
      if (plans.length > 0) {
        console.log('📊 First plan:', JSON.stringify(plans[0], null, 2));
      }
    } catch (error) {
      console.error('❌ findByUserId error:', error.message);
      console.error('Stack:', error.stack);
    }
    
    // Test Plan.create
    try {
      const newPlan = await Plan.create({
        userId: userId,
        title: 'Test Plan',
        query: 'Test query',
        plan: 'Test plan content',
        isFavorite: false
      });
      console.log('✅ create success:', JSON.stringify(newPlan, null, 2));
    } catch (error) {
      console.error('❌ create error:', error.message);
      console.error('Stack:', error.stack);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testPlansAPI();
