const axios = require('axios');

const fallbackFlights = [
  {
    flight_number: 'TF-201',
    airline: { name: 'TripFlow Air' },
    departure: { airport: 'DEL', timezone: 'Asia/Kolkata', scheduled: '2026-10-12T06:30:00+05:30' },
    arrival: { airport: 'GOI', timezone: 'Asia/Kolkata', scheduled: '2026-10-12T08:40:00+05:30' },
    price: 4200,
    currency: 'INR',
    duration: '2h 10m',
  },
  {
    flight_number: 'TF-412',
    airline: { name: 'SkyJet' },
    departure: { airport: 'DEL', timezone: 'Asia/Kolkata', scheduled: '2026-10-12T11:45:00+05:30' },
    arrival: { airport: 'GOI', timezone: 'Asia/Kolkata', scheduled: '2026-10-12T13:55:00+05:30' },
    price: 5100,
    currency: 'INR',
    duration: '2h 10m',
  },
  {
    flight_number: 'TF-850',
    airline: { name: 'AeroConnect' },
    departure: { airport: 'DEL', timezone: 'Asia/Kolkata', scheduled: '2026-10-12T18:20:00+05:30' },
    arrival: { airport: 'GOI', timezone: 'Asia/Kolkata', scheduled: '2026-10-12T20:40:00+05:30' },
    price: 6100,
    currency: 'INR',
    duration: '2h 20m',
  },
];

const searchFlights = async ({ from, to, date }) => {
  const apiKey = process.env.AVIATIONSTACK_ACCESS_KEY;

  if (!apiKey) {
    return fallbackFlights.map((flight) => ({
      ...flight,
      source: from,
      destination: to,
      date: date || '2026-10-12',
    }));
  }

  try {
    const response = await axios.get('http://api.aviationstack.com/v1/flights', {
      params: {
        access_key: apiKey,
        dep_iata: from,
        arr_iata: to,
        limit: 20,
        flight_date: date,
      },
      timeout: 10000,
    });

    if (!response.data || !Array.isArray(response.data.data)) {
      return fallbackFlights;
    }

    return response.data.data.map((flight) => ({
      flight_number: flight.flight?.iata || flight.flight?.number || 'N/A',
      airline: flight.airline || { name: 'Unknown Airline' },
      departure: flight.departure || {},
      arrival: flight.arrival || {},
      price: flight.flight?.price || 0,
      currency: flight.currency || 'INR',
      duration: flight.duration || 'N/A',
      source: from,
      destination: to,
      date: date || flight.departure?.scheduled?.slice(0, 10),
    }));
  } catch (error) {
    return fallbackFlights.map((flight) => ({
      ...flight,
      source: from,
      destination: to,
      date: date || '2026-10-12',
    }));
  }
};

module.exports = {
  searchFlights,
};
