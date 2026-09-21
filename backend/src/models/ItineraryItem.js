const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    activity: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const ItineraryItem = mongoose.model('ItineraryItem', itineraryItemSchema);

module.exports = ItineraryItem;
