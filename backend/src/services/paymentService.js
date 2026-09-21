const Razorpay = require('razorpay');
const shortid = require('shortid');

const createPaymentOrder = async ({ amount, currency = 'INR', receipt = 'tripflow-order' }) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return {
      mock: true,
      id: `mock_${shortid.generate()}`,
      currency,
      amount: Number(amount) * 100,
      receipt: receipt || `tripflow_${shortid.generate()}`,
      status: 'mocked',
    };
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const order = await razorpay.orders.create({
    amount: Number(amount) * 100,
    currency,
    receipt: receipt || `tripflow_${shortid.generate()}`,
    payment_capture: 1,
  });

  return {
    ...order,
    mock: false,
  };
};

module.exports = {
  createPaymentOrder,
};
