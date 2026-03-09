const { connectToDatabase, sql } = require('../../config/database');

class PasswordReset {
  static async create(resetData) {
    const pool = await connectToDatabase();
    const { userId, email, resetToken, expiresAt } = resetData;
    
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .input('email', sql.NVarChar, email.toLowerCase())
      .input('resetToken', sql.NVarChar, resetToken)
      .input('expiresAt', sql.DateTime2, expiresAt)
      .query(`
        INSERT INTO PasswordResets (userId, email, resetToken, expiresAt)
        OUTPUT INSERTED.*
        VALUES (@userId, @email, @resetToken, @expiresAt)
      `);
    
    return result.recordset[0];
  }

  static async findByEmailAndToken(email, token) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase())
      .input('token', sql.NVarChar, token)
      .query(`
        SELECT * FROM PasswordResets 
        WHERE email = @email AND resetToken = @token AND used = 0 AND expiresAt > GETUTCDATE()
      `);
    
    return result.recordset[0];
  }

  static async deleteByUserId(userId) {
    const pool = await connectToDatabase();
    
    await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('DELETE FROM PasswordResets WHERE userId = @userId');
  }

  static async markAsUsed(id) {
    const pool = await connectToDatabase();
    
    await pool.request()
      .input('id', sql.NVarChar, id)
      .query('UPDATE PasswordResets SET used = 1 WHERE id = @id');
  }
}

module.exports = PasswordReset;
