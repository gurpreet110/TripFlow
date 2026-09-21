const express = require('express');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const ItineraryItem = require('../models/ItineraryItem');
const Expense = require('../models/Expense');
const SavedPlace = require('../models/SavedPlace');
const ChecklistItem = require('../models/ChecklistItem');
const { authMiddleware, requireTripAccess, requireTripOwner } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { name, destination, description, startDate, endDate } = req.body;

    if (!name || !destination || !startDate || !endDate) {
      return res.status(400).json({ message: 'Trip name, destination, and dates are required.' });
    }

    const trip = await Trip.create({
      name,
      destination,
      description: description || '',
      startDate,
      endDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    req.user.trips = req.user.trips || [];
    req.user.trips.push(trip._id);
    await req.user.save();

    return res.status(201).json({ trip });
  } catch (error) {
    return res.status(500).json({ message: 'Trip creation failed.', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({ $or: [{ owner: req.user._id }, { 'members.user': req.user._id }] }).populate('members.user', 'name email');
    return res.status(200).json({ trips });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch trips.', error: error.message });
  }
});

router.get('/:tripId', requireTripAccess, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
      .populate('members.user', 'name email')
      .populate('bookings')
      .populate('itinerary')
      .populate('expenses')
      .populate('savedPlaces')
      .populate('checklist');

    return res.status(200).json({ trip });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch trip details.', error: error.message });
  }
});

router.put('/:tripId', requireTripOwner, async (req, res) => {
  try {
    const trip = req.trip;
    const allowedFields = ['name', 'destination', 'description', 'startDate', 'endDate'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) trip[field] = req.body[field];
    });

    await trip.save();
    return res.status(200).json({ trip });
  } catch (error) {
    return res.status(500).json({ message: 'Trip update failed.', error: error.message });
  }
});

router.delete('/:tripId', requireTripOwner, async (req, res) => {
  try {
    await Booking.deleteMany({ trip: req.params.tripId });
    await ItineraryItem.deleteMany({ trip: req.params.tripId });
    await Expense.deleteMany({ trip: req.params.tripId });
    await SavedPlace.deleteMany({ trip: req.params.tripId });
    await ChecklistItem.deleteMany({ trip: req.params.tripId });
    await Trip.findByIdAndDelete(req.params.tripId);

    return res.status(200).json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Trip deletion failed.', error: error.message });
  }
});

router.post('/:tripId/members', requireTripOwner, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    const trip = req.trip;
    const User = require('../models/User');
    const memberUser = await User.findOne({ email: email.toLowerCase() });

    if (!memberUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const alreadyMember = trip.members.some((member) => member.user.toString() === memberUser._id.toString());
    if (alreadyMember) {
      return res.status(409).json({ message: 'User is already a member of this trip.' });
    }

    trip.members.push({ user: memberUser._id, role });
    await trip.save();

    return res.status(201).json({ trip });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to add trip member.', error: error.message });
  }
});

router.get('/:tripId/members', requireTripAccess, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate('members.user', 'name email');
    return res.status(200).json({ members: trip.members });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch members.', error: error.message });
  }
});

router.delete('/:tripId/members/:memberId', requireTripOwner, async (req, res) => {
  try {
    const trip = req.trip;
    trip.members = trip.members.filter((member) => member.user.toString() !== req.params.memberId);
    await trip.save();
    return res.status(200).json({ trip });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to remove member.', error: error.message });
  }
});

router.post('/:tripId/itinerary', requireTripAccess, async (req, res) => {
  try {
    const item = await ItineraryItem.create({
      ...req.body,
      trip: req.params.tripId,
      createdBy: req.user._id,
    });

    await Trip.findByIdAndUpdate(req.params.tripId, { $push: { itinerary: item._id } });
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create itinerary item.', error: error.message });
  }
});

router.get('/:tripId/itinerary', requireTripAccess, async (req, res) => {
  try {
    const items = await ItineraryItem.find({ trip: req.params.tripId }).sort({ date: 1, time: 1 });
    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch itinerary.', error: error.message });
  }
});

router.put('/:tripId/itinerary/:itemId', requireTripAccess, async (req, res) => {
  try {
    const item = await ItineraryItem.findOneAndUpdate(
      { _id: req.params.itemId, trip: req.params.tripId },
      { $set: req.body },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Itinerary item not found.' });
    }

    return res.status(200).json({ item });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update itinerary item.', error: error.message });
  }
});

router.delete('/:tripId/itinerary/:itemId', requireTripAccess, async (req, res) => {
  try {
    const deleted = await ItineraryItem.findOneAndDelete({ _id: req.params.itemId, trip: req.params.tripId });
    if (!deleted) return res.status(404).json({ message: 'Itinerary item not found.' });

    await Trip.findByIdAndUpdate(req.params.tripId, { $pull: { itinerary: deleted._id } });
    return res.status(200).json({ message: 'Itinerary item deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete itinerary item.', error: error.message });
  }
});

router.post('/:tripId/bookings', requireTripAccess, async (req, res) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      trip: req.params.tripId,
      user: req.user._id,
    });

    await Trip.findByIdAndUpdate(req.params.tripId, { $push: { bookings: booking._id } });
    return res.status(201).json({ booking });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create booking.', error: error.message });
  }
});

router.get('/:tripId/bookings', requireTripAccess, async (req, res) => {
  try {
    const bookings = await Booking.find({ trip: req.params.tripId }).sort({ bookingDate: -1 });
    return res.status(200).json({ bookings });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch bookings.', error: error.message });
  }
});

router.put('/:tripId/bookings/:bookingId', requireTripAccess, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, trip: req.params.tripId },
      { $set: req.body },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    return res.status(200).json({ booking });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update booking.', error: error.message });
  }
});

router.delete('/:tripId/bookings/:bookingId', requireTripAccess, async (req, res) => {
  try {
    const deleted = await Booking.findOneAndDelete({ _id: req.params.bookingId, trip: req.params.tripId });
    if (!deleted) return res.status(404).json({ message: 'Booking not found.' });

    await Trip.findByIdAndUpdate(req.params.tripId, { $pull: { bookings: deleted._id } });
    return res.status(200).json({ message: 'Booking deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete booking.', error: error.message });
  }
});

router.post('/:tripId/expenses', requireTripAccess, async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      trip: req.params.tripId,
      createdBy: req.user._id,
    });

    await Trip.findByIdAndUpdate(req.params.tripId, { $push: { expenses: expense._id } });
    return res.status(201).json({ expense });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create expense.', error: error.message });
  }
});

router.get('/:tripId/expenses', requireTripAccess, async (req, res) => {
  try {
    const expenses = await Expense.find({ trip: req.params.tripId }).sort({ date: -1 });
    return res.status(200).json({ expenses });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch expenses.', error: error.message });
  }
});

router.put('/:tripId/expenses/:expenseId', requireTripAccess, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.expenseId, trip: req.params.tripId },
      { $set: req.body },
      { new: true }
    );

    if (!expense) return res.status(404).json({ message: 'Expense not found.' });
    return res.status(200).json({ expense });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update expense.', error: error.message });
  }
});

router.delete('/:tripId/expenses/:expenseId', requireTripAccess, async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.expenseId, trip: req.params.tripId });
    if (!deleted) return res.status(404).json({ message: 'Expense not found.' });

    await Trip.findByIdAndUpdate(req.params.tripId, { $pull: { expenses: deleted._id } });
    return res.status(200).json({ message: 'Expense deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete expense.', error: error.message });
  }
});

router.post('/:tripId/saved-places', requireTripAccess, async (req, res) => {
  try {
    const place = await SavedPlace.create({
      ...req.body,
      trip: req.params.tripId,
      createdBy: req.user._id,
    });

    await Trip.findByIdAndUpdate(req.params.tripId, { $push: { savedPlaces: place._id } });
    return res.status(201).json({ place });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save place.', error: error.message });
  }
});

router.get('/:tripId/saved-places', requireTripAccess, async (req, res) => {
  try {
    const places = await SavedPlace.find({ trip: req.params.tripId });
    return res.status(200).json({ places });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch saved places.', error: error.message });
  }
});

router.delete('/:tripId/saved-places/:placeId', requireTripAccess, async (req, res) => {
  try {
    const deleted = await SavedPlace.findOneAndDelete({ _id: req.params.placeId, trip: req.params.tripId });
    if (!deleted) return res.status(404).json({ message: 'Saved place not found.' });

    await Trip.findByIdAndUpdate(req.params.tripId, { $pull: { savedPlaces: deleted._id } });
    return res.status(200).json({ message: 'Saved place deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete saved place.', error: error.message });
  }
});

router.post('/:tripId/checklist', requireTripAccess, async (req, res) => {
  try {
    const item = await ChecklistItem.create({
      ...req.body,
      trip: req.params.tripId,
      createdBy: req.user._id,
    });

    await Trip.findByIdAndUpdate(req.params.tripId, { $push: { checklist: item._id } });
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create checklist item.', error: error.message });
  }
});

router.get('/:tripId/checklist', requireTripAccess, async (req, res) => {
  try {
    const items = await ChecklistItem.find({ trip: req.params.tripId }).sort({ createdAt: 1 });
    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch checklist.', error: error.message });
  }
});

router.put('/:tripId/checklist/:itemId', requireTripAccess, async (req, res) => {
  try {
    const item = await ChecklistItem.findOneAndUpdate(
      { _id: req.params.itemId, trip: req.params.tripId },
      { $set: req.body },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Checklist item not found.' });
    return res.status(200).json({ item });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update checklist item.', error: error.message });
  }
});

router.delete('/:tripId/checklist/:itemId', requireTripAccess, async (req, res) => {
  try {
    const deleted = await ChecklistItem.findOneAndDelete({ _id: req.params.itemId, trip: req.params.tripId });
    if (!deleted) return res.status(404).json({ message: 'Checklist item not found.' });

    await Trip.findByIdAndUpdate(req.params.tripId, { $pull: { checklist: deleted._id } });
    return res.status(200).json({ message: 'Checklist item deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete checklist item.', error: error.message });
  }
});

module.exports = router;
