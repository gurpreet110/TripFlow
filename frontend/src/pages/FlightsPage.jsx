import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import '../index.css';

export default function FlightsPage() {
  const [form, setForm] = useState({ from: 'DEL', to: 'GOI', date: '2026-10-12' });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('tripflow-token');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await api.get(`/flights/search?from=${form.from}&to=${form.to}&date=${form.date}`, token);
    setFlights(res.flights || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <nav className="flex justify-between items-center bg-white rounded-2xl shadow-soft p-4 mb-6">
          <Link to="/dashboard" className="text-2xl font-bold text-tripflow-700">TripFlow</Link>
          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/trips">Trips</Link>
            <Link to="/flights">Flights</Link>
          </div>
        </nav>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h1 className="text-2xl font-bold mb-4">Search flights</h1>
          <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-3">
            <input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder="From" className="border rounded-xl p-3" />
            <input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="To" className="border rounded-xl p-3" />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded-xl p-3" />
            <button type="submit" className="bg-tripflow-600 text-white rounded-xl p-3 font-semibold">Search</button>
          </form>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-soft p-6 text-slate-500">Searching flights...</div>
          ) : flights.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft p-6 text-slate-500">No flight results found.</div>
          ) : (
            flights.map((flight, index) => (
              <div key={`${flight.flight_number}-${index}`} className="bg-white rounded-2xl shadow-soft p-5 flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold text-slate-800">{flight.airline?.name || 'Airline'}</div>
                  <div className="text-sm text-slate-500">{flight.flight_number} • {flight.departure?.airport} → {flight.arrival?.airport}</div>
                  <div className="text-sm text-slate-500 mt-1">{flight.departure?.scheduled?.slice(0, 10)} • {flight.duration}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-tripflow-700">₹{flight.price || 0}</div>
                  <button className="mt-2 bg-tripflow-600 text-white px-4 py-2 rounded-xl text-sm">Book</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
