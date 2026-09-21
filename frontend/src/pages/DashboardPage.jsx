import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import '../index.css';
// import '../App.css';

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleLogout = () => {
    localStorage.removeItem('tripflow-token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <nav className="flex justify-between items-center bg-white rounded-2xl shadow-soft p-4 mb-6">
          <div className="text-2xl font-bold text-tripflow-700">
            TripFlow
          </div>

          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/trips">My Trips</Link>
            <Link to="/flights">Flights</Link>

            <button onClick={handleLogout} className="text-red-500">
              Logout
            </button>
          </div>
        </nav>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Upcoming trips"
            value={trips.length.toString()}
          />

          <StatCard
            title="Active trips"
            value={trips.length > 0 ? '1' : '0'}
          />

          <StatCard
            title="Recent bookings"
            value="3"
          />

          <StatCard
            title="Total spend"
            value="₹0"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Your trips
            </h2>

            <Link
              to="/trips"
              className="bg-tripflow-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              Plan a trip
            </Link>
          </div>

          {loading ? (
            <p>Loading your travel workspace...</p>
          ) : trips.length === 0 ? (
            <div className="border border-dashed rounded-2xl p-8 text-center text-slate-500">
              No trips yet. Start by creating your first trip.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {trips.map((trip) => (
                <Link
                  key={trip._id}
                  to={`/trips/${trip._id}`}
                  className="border border-slate-200 rounded-2xl p-4 hover:border-tripflow-400 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-semibold text-slate-800">
                        {trip.name}
                      </div>

                      <div className="text-sm text-slate-500">
                        {trip.destination}
                      </div>
                    </div>

                    <span className="bg-tripflow-100 text-tripflow-700 px-2 py-1 text-xs rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="mt-4 text-sm text-slate-600">
                    {new Date(trip.startDate).toLocaleDateString()} -{' '}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-5">
      <div className="text-sm text-slate-500">
        {title}
      </div>

      <div className="mt-3 text-3xl font-bold text-slate-800">
        {value}
      </div>
    </div>
  );
}

