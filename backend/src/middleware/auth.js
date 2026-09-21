const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Trip = require('../models/Trip');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tripflow-secret');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireTripAccess = async (req, res, next) => {
  const { tripId } = req.params;

  if (!tripId) {
    return res.status(400).json({ message: 'Trip ID is required.' });
  }

  try {
    const trip = await Trip.findById(tripId).lean();

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    const isOwner = trip.owner?.toString() === req.user._id.toString();
    const isMember = trip.members?.some((member) => member.user.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'You do not have access to this trip.' });
    }

    req.trip = trip;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to validate trip access.' });
  }
};

const requireTripOwner = async (req, res, next) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the trip owner can perform this action.' });
    }

    req.trip = trip;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to validate ownership.' });
  }
};

module.exports = {
  authMiddleware,
  requireTripAccess,
  requireTripOwner,
};
