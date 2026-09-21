import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import '../index.css';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({
    name: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('tripflow-token');

    if (!token) {
      navigate('/');
      return;
    }

    const loadTrips = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/trips');

        setTrips(response.trips || []);
      } catch (error) {
        console.error('Failed to load trips:', error);
        setError(error.message || 'Unable to load trips.');
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError('');

      const response = await api.post('/trips', form);

      if (response.trip) {
        navigate(`/trips/${response.trip._id}`);
      }
    } catch (error) {
      console.error('Failed to create trip:', error);
      setError(error.message || 'Unable to create trip.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Navigation */}
        <nav className="flex justify-between items-center bg-white rounded-2xl shadow-soft p-4 mb-6">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-tripflow-700"
          >
            TripFlow
          </Link>

          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/trips">My Trips</Link>
            <Link to="/flights">Flights</Link>
          </div>
        </nav>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_420px] gap-6">

          {/* Trips List */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold mb-4">
              Trips
            </h2>

            {loading ? (
              <div className="border border-dashed rounded-2xl p-8 text-center text-slate-500">
                Loading your trips...
              </div>
            ) : trips.length === 0 ? (
              <div className="border border-dashed rounded-2xl p-8 text-center text-slate-500">
                No trips created yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {trips.map((trip) => (
                  <Link
                    key={trip._id}
                    to={`/trips/${trip._id}`}
                    className="border border-slate-200 rounded-2xl p-4 hover:border-tripflow-400 transition"
                  >
                    <div className="flex justify-between">

                      <div>
                        <div className="text-lg font-semibold text-slate-800">
                          {trip.name}
                        </div>

                        <div className="text-sm text-slate-500">
                          {trip.destination}
                        </div>
                      </div>

                      <span className="text-xs bg-tripflow-100 text-tripflow-700 px-2 py-1 rounded-full">
                        Trip
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                      {new Date(trip.startDate).toLocaleDateString()}
                      {' → '}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Create Trip */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-soft p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-slate-800">
              Create trip
            </h2>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Trip name"
              required
              className="w-full border border-slate-200 rounded-xl p-3"
            />

            <input
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="Destination"
              required
              className="w-full border border-slate-200 rounded-xl p-3"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border border-slate-200 rounded-xl p-3 min-h-[100px]"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-xl p-3"
              />

              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-xl p-3"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-tripflow-600 text-white rounded-xl p-3 font-semibold hover:bg-tripflow-700 disabled:opacity-60"
            >
              {creating ? 'Creating trip...' : 'Create trip'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

