const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Ulaşım', 'Konaklama', 'Yemek', 'Aktivite', 'Alışveriş', 'Diğer'],
    default: 'Diğer' 
  },
  date: { type: Date, default: Date.now }
});

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    travelName: { type: String, required: true },
    totalBudget: { type: Number, required: true },
    expenses: [expenseSchema],
    currency: { type: String, default: 'TRY' }
  },
  { timestamps: true }
);

// Virtual: Kalan bütçe
budgetSchema.virtual('remainingBudget').get(function() {
  const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return this.totalBudget - totalExpenses;
});

// Virtual: Toplam harcama
budgetSchema.virtual('totalExpenses').get(function() {
  return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
