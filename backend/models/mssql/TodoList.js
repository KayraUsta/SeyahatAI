const { connectToDatabase, sql } = require('../../config/database');

class TodoList {
  static async create(listData) {
    const pool = await connectToDatabase();
    const { userId, travelName } = listData;
    
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .input('travelName', sql.NVarChar, travelName)
      .query(`
        INSERT INTO TodoLists (userId, travelName)
        OUTPUT INSERTED.id, INSERTED.userId, INSERTED.travelName, 
               INSERTED.createdAt, INSERTED.updatedAt
        VALUES (@userId, @travelName)
      `);
    
    const list = result.recordset[0];
    list.items = []; // Initialize with empty items
    return list;
  }

  static async findByUserId(userId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('SELECT * FROM TodoLists WHERE userId = @userId ORDER BY createdAt DESC');
    
    // Get items for each list
    const lists = [];
    for (const list of result.recordset) {
      const items = await this.getItems(list.id);
      lists.push({
        ...list,
        items
      });
    }
    
    return lists;
  }

  static async findById(id) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT * FROM TodoLists WHERE id = @id');
    
    if (result.recordset.length === 0) return null;
    
    const list = result.recordset[0];
    const items = await this.getItems(id);
    
    return {
      ...list,
      items
    };
  }

  static async findByIdAndUserId(id, userId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT * FROM TodoLists WHERE id = @id AND userId = @userId');
    
    if (result.recordset.length === 0) return null;
    
    const list = result.recordset[0];
    const items = await this.getItems(id);
    
    return {
      ...list,
      items
    };
  }

  static async getItems(listId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('listId', sql.NVarChar, listId)
      .query('SELECT * FROM TodoItems WHERE listId = @listId ORDER BY createdAt ASC');
    
    return result.recordset;
  }

  static async addItem(listId, itemData) {
    const pool = await connectToDatabase();
    const { text } = itemData;
    
    const result = await pool.request()
      .input('listId', sql.NVarChar, listId)
      .input('text', sql.NVarChar, text)
      .query(`
        INSERT INTO TodoItems (listId, text)
        OUTPUT INSERTED.*
        VALUES (@listId, @text)
      `);
    
    return result.recordset[0];
  }

  static async toggleItem(itemId) {
    const pool = await connectToDatabase();
    
    // First get current completed status
    const current = await this.getItemById(itemId);
    if (!current) return null;
    
    const newCompleted = !current.completed;
    
    await pool.request()
      .input('itemId', sql.NVarChar, itemId)
      .input('completed', sql.Bit, newCompleted)
      .query('UPDATE TodoItems SET completed = @completed WHERE id = @itemId');
    
    return { ...current, completed: newCompleted };
  }

  static async getItemById(itemId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('itemId', sql.NVarChar, itemId)
      .query('SELECT * FROM TodoItems WHERE id = @itemId');
    
    return result.recordset[0];
  }

  static async deleteItem(itemId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('itemId', sql.NVarChar, itemId)
      .query('DELETE FROM TodoItems OUTPUT DELETED.* WHERE id = @itemId');
    
    return result.recordset[0];
  }

  static async deleteById(id, userId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query('DELETE FROM TodoLists OUTPUT DELETED.* WHERE id = @id AND userId = @userId');
    
    return result.recordset[0];
  }
}

module.exports = TodoList;
