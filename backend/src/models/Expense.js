const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Food', 'Transport', 'Hotel', 'Activities', 'Shopping', 'Other'],
      default: 'Other',
    },
    date: { type: String, required: true },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
