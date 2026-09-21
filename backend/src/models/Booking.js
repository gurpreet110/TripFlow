const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingType: { type: String, enum: ['Flight', 'Hotel', 'Train', 'Bus', 'Other'], default: 'Flight' },
    provider: { type: String, default: '' },
    referenceNumber: { type: String, default: '' },
    bookingDate: { type: Date, default: Date.now },
    time: { type: String, default: '' },
    origin: { type: String, default: '' },
    destination: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
