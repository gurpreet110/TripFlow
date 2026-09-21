import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
// import '../index.css';
// import '../App.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const response = await api.post(endpoint, form);
      if (response.token) {
        localStorage.setItem('tripflow-token', response.token);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Authentication failed.');
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      setError('Unable to complete authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 overflow-hidden rounded-3xl shadow-soft bg-white">
        <div className="bg-gradient-to-br from-tripflow-700 to-tripflow-500 p-8 text-white">
          <div className="text-3xl font-bold mb-3">TripFlow</div>
          <p className="text-tripflow-100 mb-8">Everything for your trip, in one flow.</p>
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl bg-white/10 p-4">Create trips, manage bookings, track expenses, and save places in one place.</div>
            <div className="rounded-2xl bg-white/10 p-4">Plan itineraries, share trip members, and keep travel checklists in sync.</div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-800">{isRegister ? 'Create account' : 'Welcome back'}</h1>
            <button className="text-sm font-medium text-tripflow-700" onClick={() => setIsRegister((prev) => !prev)}>
              {isRegister ? 'Login instead' : 'Register'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-tripflow-500"
              />
            )}
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-tripflow-500"
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-tripflow-500"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-tripflow-600 text-white rounded-xl p-3 font-semibold hover:bg-tripflow-700 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
