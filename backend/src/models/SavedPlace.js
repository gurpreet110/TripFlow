const mongoose = require('mongoose');

const savedPlaceSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'Other' },
    location: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const SavedPlace = mongoose.model('SavedPlace', savedPlaceSchema);

module.exports = SavedPlace;
