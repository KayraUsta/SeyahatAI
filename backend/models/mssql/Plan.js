const { connectToDatabase, sql } = require('../../config/database');

class Plan {
  static async create(planData) {
    const pool = await connectToDatabase();
    const { userId, title, query, plan, isFavorite = false } = planData;
    
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .input('planTitle', sql.NVarChar, title)
      .input('searchQuery', sql.NVarChar, query)
      .input('travelPlan', sql.NVarChar, plan)
      .input('isFavorite', sql.Bit, isFavorite)
      .query(`
        INSERT INTO Plans (userId, planTitle, searchQuery, travelPlan, isFavorite)
        OUTPUT INSERTED.id, INSERTED.userId, INSERTED.planTitle as title, 
               INSERTED.searchQuery as query, INSERTED.travelPlan as planContent, 
               INSERTED.isFavorite, INSERTED.createdAt, INSERTED.updatedAt
        VALUES (@userId, @planTitle, @searchQuery, @travelPlan, @isFavorite)
      `);
    
    return result.recordset[0];
  }

  static async findByUserId(userId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id, userId, planTitle as title, searchQuery as query, travelPlan as planContent, isFavorite, createdAt, updatedAt FROM Plans WHERE userId = @userId ORDER BY createdAt DESC');
    
    return result.recordset;
  }

  static async findById(id) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT id, userId, planTitle as title, searchQuery as query, travelPlan as planContent, isFavorite, createdAt, updatedAt FROM Plans WHERE id = @id');
    
    return result.recordset[0];
  }

  static async findByIdAndUserId(id, userId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id, userId, planTitle as title, searchQuery as query, travelPlan as planContent, isFavorite, createdAt, updatedAt FROM Plans WHERE id = @id AND userId = @userId');
    
    return result.recordset[0];
  }

  static async deleteById(id, userId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query('DELETE FROM Plans OUTPUT DELETED.id, DELETED.userId, DELETED.planTitle as title, DELETED.searchQuery as query, DELETED.travelPlan as planContent, DELETED.isFavorite, DELETED.createdAt, DELETED.updatedAt WHERE id = @id AND userId = @userId');
    
    return result.recordset[0];
  }

  static async toggleFavorite(id, userId) {
    const pool = await connectToDatabase();
    
    // First get current favorite status
    const current = await this.findByIdAndUserId(id, userId);
    if (!current) return null;
    
    const newFavorite = !current.isFavorite;
    
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .input('isFavorite', sql.Bit, newFavorite)
      .input('updatedAt', sql.DateTime2, new Date())
      .query(`
        UPDATE Plans 
        SET isFavorite = @isFavorite, updatedAt = @updatedAt 
        WHERE id = @id AND userId = @userId
      `);
    
    return { ...current, isFavorite: newFavorite };
  }
}

module.exports = Plan;
