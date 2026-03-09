const { connectToDatabase, sql } = require('../../config/database');

class Budget {
  static async create(budgetData) {
    const pool = await connectToDatabase();
    const { userId, travelName, totalBudget, currency = 'TRY' } = budgetData;
    
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .input('travelName', sql.NVarChar, travelName)
      .input('totalBudget', sql.Decimal(18, 2), totalBudget)
      .input('currency', sql.NVarChar, currency)
      .query(`
        INSERT INTO Budgets (userId, travelName, totalBudget, currency)
        OUTPUT INSERTED.id, INSERTED.userId, INSERTED.travelName, 
               INSERTED.totalBudget, INSERTED.currency, INSERTED.createdAt, INSERTED.updatedAt
        VALUES (@userId, @travelName, @totalBudget, @currency)
      `);
    
    const budget = result.recordset[0];
    budget.expenses = []; // Initialize with empty expenses
    return budget;
  }

  static async findByUserId(userId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('SELECT * FROM Budgets WHERE userId = @userId ORDER BY createdAt DESC');
    
    // Get expenses for each budget
    const budgets = [];
    for (const budget of result.recordset) {
      const expenses = await this.getExpenses(budget.id);
      budgets.push({
        ...budget,
        expenses,
        totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        remainingBudget: budget.totalBudget - expenses.reduce((sum, exp) => sum + exp.amount, 0)
      });
    }
    
    return budgets;
  }

  static async findById(id) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT * FROM Budgets WHERE id = @id');
    
    if (result.recordset.length === 0) return null;
    
    const budget = result.recordset[0];
    const expenses = await this.getExpenses(id);
    
    return {
      ...budget,
      expenses,
      totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      remainingBudget: budget.totalBudget - expenses.reduce((sum, exp) => sum + exp.amount, 0)
    };
  }

  static async findByIdAndUserId(id, userId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT * FROM Budgets WHERE id = @id AND userId = @userId');
    
    if (result.recordset.length === 0) return null;
    
    const budget = result.recordset[0];
    const expenses = await this.getExpenses(id);
    
    return {
      ...budget,
      expenses,
      totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      remainingBudget: budget.totalBudget - expenses.reduce((sum, exp) => sum + exp.amount, 0)
    };
  }

  static async getExpenses(budgetId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('budgetId', sql.NVarChar, budgetId)
      .query('SELECT * FROM Expenses WHERE budgetId = @budgetId ORDER BY date DESC');
    
    return result.recordset;
  }

  static async addExpense(budgetId, expenseData) {
    const pool = await connectToDatabase();
    const { description, amount, category = 'Diğer' } = expenseData;
    
    const result = await pool.request()
      .input('budgetId', sql.NVarChar, budgetId)
      .input('description', sql.NVarChar, description)
      .input('amount', sql.Decimal(18, 2), amount)
      .input('category', sql.NVarChar, category)
      .query(`
        INSERT INTO Expenses (budgetId, description, amount, category)
        OUTPUT INSERTED.*
        VALUES (@budgetId, @description, @amount, @category)
      `);
    
    return result.recordset[0];
  }

  static async deleteExpense(expenseId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('expenseId', sql.NVarChar, expenseId)
      .query('DELETE FROM Expenses OUTPUT DELETED.* WHERE id = @expenseId');
    
    return result.recordset[0];
  }

  static async deleteById(id, userId) {
    const pool = await connectToDatabase();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query('DELETE FROM Budgets OUTPUT DELETED.* WHERE id = @id AND userId = @userId');
    
    return result.recordset[0];
  }
}

module.exports = Budget;
