const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { createPaymentOrder } = require('../services/paymentService');

const router = express.Router();

router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    const result = await createPaymentOrder({ amount, currency, receipt });
    return res.status(200).json({ order: result });
  } catch (error) {
    return res.status(500).json({ message: 'Payment order creation failed.', error: error.message });
  }
});

module.exports = router;
