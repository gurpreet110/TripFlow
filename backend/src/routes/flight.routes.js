const express = require('express');
const { searchFlights } = require('../services/flightService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'From and to airports are required.' });
    }

    const flights = await searchFlights({ from: from.toUpperCase(), to: to.toUpperCase(), date });
    return res.status(200).json({ flights });
  } catch (error) {
    return res.status(500).json({ message: 'Flight search failed.', error: error.message });
  }
});

module.exports = router;
