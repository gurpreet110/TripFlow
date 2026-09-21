const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connect = require('./config/db');

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

const frontendUrl = process.env.FRONTEND_URL;

app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const flightRoutes = require('./routes/flight.routes');
const paymentRoutes = require('./routes/payment.routes');

app.get('/', (req, res) => {
  res.json({
    app: 'TripFlow API',
    status: 'running',
    message: 'TripFlow travel management platform backend',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/payments', paymentRoutes);

const start = async () => {
  try {
    await connect();
    console.log('Database connected successfully.');

    app.listen(port, () => {
      console.log(`TripFlow API listening on port ${port}!`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = start;