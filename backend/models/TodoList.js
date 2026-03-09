const mongoose = require('mongoose');

const todoItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const todoListSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    travelName: { type: String, required: true },
    items: [todoItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('TodoList', todoListSchema);
