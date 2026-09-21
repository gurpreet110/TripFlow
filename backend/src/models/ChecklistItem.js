const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const ChecklistItem = mongoose.model('ChecklistItem', checklistItemSchema);

module.exports = ChecklistItem;
