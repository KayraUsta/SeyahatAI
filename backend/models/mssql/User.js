const { connectToDatabase, sql } = require('../../config/database');

class User {
  static async create(userData) {
    const pool = await connectToDatabase();
    const { name, email, password } = userData;
    
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email.toLowerCase())
      .input('password', sql.NVarChar, password)
      .query(`
        INSERT INTO Users (name, email, password)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.createdAt, INSERTED.updatedAt
        VALUES (@name, @email, @password)
      `);
    
    return result.recordset[0];
  }

  static async findByEmail(email) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase())
      .query('SELECT * FROM Users WHERE email = @email');
    
    return result.recordset[0];
  }

  static async findById(id) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT * FROM Users WHERE id = @id');
    
    return result.recordset[0];
  }

  static async updatePassword(id, newPassword) {
    const pool = await connectToDatabase();
    
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('password', sql.NVarChar, newPassword)
      .input('updatedAt', sql.DateTime2, new Date())
      .query(`
        UPDATE Users 
        SET password = @password, updatedAt = @updatedAt 
        WHERE id = @id
      `);
  }

  static async findAll() {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .query('SELECT * FROM Users ORDER BY createdAt DESC');
    
    return result.recordset;
  }
}

module.exports = User;
