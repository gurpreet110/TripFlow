const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['owner', 'member'], default: 'member' },
      },
    ],
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    itinerary: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ItineraryItem' }],
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
    savedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SavedPlace' }],
    checklist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChecklistItem' }],
  },
  { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
