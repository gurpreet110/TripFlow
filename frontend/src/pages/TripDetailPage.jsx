import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import '../index.css';
const tabs = ['Overview', 'Itinerary', 'Bookings', 'Expenses', 'Saved Places', 'Checklist', 'Members'];

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    itinerary: { date: '', time: '', activity: '', location: '', description: '' },
    expense: { title: '', amount: '', category: 'Food', date: '', notes: '' },
    savedPlace: { name: '', category: 'Restaurant', location: '', notes: '' },
    checklist: { text: '' },
    booking: { bookingType: 'Flight', amount: '', origin: '', destination: '', provider: '', referenceNumber: '', date: '' },
  });

  const token = localStorage.getItem('tripflow-token');

  const refreshTrip = async () => {
    if (!token) {
      navigate('/');
      return;
    }

    const response = await api.get(`/trips/${tripId}`, token);
    setTrip(response.trip);
    setLoading(false);
  };

  useEffect(() => {
    refreshTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const totalExpenses = useMemo(
    () => (trip?.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [trip]
  );

  const checklistProgress = useMemo(() => {
    const items = trip?.checklist || [];
    if (!items.length) return 0;
    const completed = items.filter((item) => item.completed).length;
    return Math.round((completed / items.length) * 100);
  }, [trip]);

  const handleInput = (section, e) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [e.target.name]: e.target.value } }));
  };

  const createItineraryItem = async (e) => {
    e.preventDefault();
    const payload = form.itinerary;
    await api.post(`/trips/${tripId}/itinerary`, payload, token);
    setForm((prev) => ({ ...prev, itinerary: { date: '', time: '', activity: '', location: '', description: '' } }));
    refreshTrip();
  };

  const createBooking = async (e) => {
    e.preventDefault();
    const payload = {
      ...form.booking,
      bookingDate: form.booking.date,
      amount: Number(form.booking.amount || 0),
      status: 'Pending',
      time: '09:00',
    };
    await api.post(`/trips/${tripId}/bookings`, payload, token);
    setForm((prev) => ({ ...prev, booking: { bookingType: 'Flight', amount: '', origin: '', destination: '', provider: '', referenceNumber: '', date: '' } }));
    refreshTrip();
  };

  const createExpense = async (e) => {
    e.preventDefault();
    await api.post(`/trips/${tripId}/expenses`, { ...form.expense, amount: Number(form.expense.amount || 0) }, token);
    setForm((prev) => ({ ...prev, expense: { title: '', amount: '', category: 'Food', date: '', notes: '' } }));
    refreshTrip();
  };

  const createSavedPlace = async (e) => {
    e.preventDefault();
    await api.post(`/trips/${tripId}/saved-places`, form.savedPlace, token);
    setForm((prev) => ({ ...prev, savedPlace: { name: '', category: 'Restaurant', location: '', notes: '' } }));
    refreshTrip();
  };

  const createChecklistItem = async (e) => {
    e.preventDefault();
    await api.post(`/trips/${tripId}/checklist`, form.checklist, token);
    setForm((prev) => ({ ...prev, checklist: { text: '' } }));
    refreshTrip();
  };

  const toggleChecklistItem = async (itemId, completed) => {
    await api.put(`/trips/${tripId}/checklist/${itemId}`, { completed: !completed }, token);
    refreshTrip();
  };

  if (loading || !trip) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading trip workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <nav className="flex justify-between items-center bg-white rounded-2xl shadow-soft p-4 mb-6">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-2xl font-bold text-tripflow-700">TripFlow</Link>
            <span className="text-slate-400">|</span>
            <div>
              <div className="font-semibold text-slate-800">{trip.name}</div>
              <div className="text-xs text-slate-500">{trip.destination}</div>
            </div>
          </div>
          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/trips">Trips</Link>
            <Link to="/flights">Flights</Link>
          </div>
        </nav>

        <div className="bg-gradient-to-r from-tripflow-700 to-tripflow-500 text-white rounded-3xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm uppercase tracking-wide text-tripflow-100">Trip workspace</div>
              <h1 className="text-3xl font-bold mt-2">{trip.name}</h1>
              <p className="mt-2 text-tripflow-100">{trip.destination} • {new Date(trip.startDate).toLocaleDateString()} to {new Date(trip.endDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3 text-right">
              <div className="text-xs uppercase text-tripflow-100">Total expenses</div>
              <div className="text-2xl font-bold">₹{totalExpenses}</div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === tab ? 'bg-tripflow-600 text-white' : 'bg-white text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-6">
          <div className="space-y-6">
            {activeTab === 'Overview' && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <SummaryCard title="Destination" value={trip.destination} />
                  <SummaryCard title="Dates" value={`${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`} />
                  <SummaryCard title="Members" value={`${trip.members?.length || 1}`} />
                </div>
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Upcoming bookings</h3>
                    <span className="text-sm text-slate-500">{(trip.bookings || []).length} total</span>
                  </div>
                  {(trip.bookings || []).length === 0 ? (
                    <div className="text-slate-500">No bookings recorded yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {(trip.bookings || []).map((booking) => (
                        <div key={booking._id} className="rounded-xl border p-3">
                          <div className="font-semibold">{booking.origin} → {booking.destination}</div>
                          <div className="text-sm text-slate-500">{booking.bookingType} • {booking.provider}</div>
                          <div className="text-sm text-slate-700 mt-1">₹{booking.amount}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'Itinerary' && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-bold mb-4">Add itinerary item</h3>
                <form onSubmit={createItineraryItem} className="grid md:grid-cols-2 gap-3 mb-6">
                  <input name="date" value={form.itinerary.date} onChange={(e) => handleInput('itinerary', e)} type="date" className="border rounded-xl p-3" />
                  <input name="time" value={form.itinerary.time} onChange={(e) => handleInput('itinerary', e)} type="time" className="border rounded-xl p-3" />
                  <input name="activity" value={form.itinerary.activity} onChange={(e) => handleInput('itinerary', e)} placeholder="Activity" className="border rounded-xl p-3 md:col-span-2" />
                  <input name="location" value={form.itinerary.location} onChange={(e) => handleInput('itinerary', e)} placeholder="Location" className="border rounded-xl p-3 md:col-span-2" />
                  <textarea name="description" value={form.itinerary.description} onChange={(e) => handleInput('itinerary', e)} placeholder="Description" className="border rounded-xl p-3 md:col-span-2" />
                  <button type="submit" className="bg-tripflow-600 text-white rounded-xl p-3 md:col-span-2">Add itinerary item</button>
                </form>
                <div className="space-y-4">
                  {(trip.itinerary || []).length === 0 ? (
                    <div className="text-slate-500">No itinerary items yet.</div>
                  ) : (
                    (trip.itinerary || []).map((item) => (
                      <div key={item._id} className="border rounded-xl p-4">
                        <div className="font-semibold text-slate-800">{item.activity}</div>
                        <div className="text-sm text-slate-500">{item.date} • {item.time} • {item.location}</div>
                        <div className="text-sm mt-2 text-slate-600">{item.description}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Bookings' && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-bold mb-4">Create booking</h3>
                <form onSubmit={createBooking} className="grid md:grid-cols-2 gap-3 mb-6">
                  <select name="bookingType" value={form.booking.bookingType} onChange={(e) => handleInput('booking', e)} className="border rounded-xl p-3">
                    <option>Flight</option>
                    <option>Hotel</option>
                    <option>Train</option>
                    <option>Bus</option>
                    <option>Other</option>
                  </select>
                  <input name="provider" value={form.booking.provider} onChange={(e) => handleInput('booking', e)} placeholder="Provider" className="border rounded-xl p-3" />
                  <input name="origin" value={form.booking.origin} onChange={(e) => handleInput('booking', e)} placeholder="Origin" className="border rounded-xl p-3" />
                  <input name="destination" value={form.booking.destination} onChange={(e) => handleInput('booking', e)} placeholder="Destination" className="border rounded-xl p-3" />
                  <input name="amount" value={form.booking.amount} onChange={(e) => handleInput('booking', e)} placeholder="Amount" type="number" className="border rounded-xl p-3" />
                  <input name="referenceNumber" value={form.booking.referenceNumber} onChange={(e) => handleInput('booking', e)} placeholder="Reference number" className="border rounded-xl p-3" />
                  <input name="date" value={form.booking.date} onChange={(e) => handleInput('booking', e)} type="date" className="border rounded-xl p-3 md:col-span-2" />
                  <button type="submit" className="bg-tripflow-600 text-white rounded-xl p-3 md:col-span-2">Create booking</button>
                </form>
                <div className="space-y-3">
                  {(trip.bookings || []).length === 0 ? (
                    <div className="text-slate-500">No bookings yet.</div>
                  ) : (
                    (trip.bookings || []).map((booking) => (
                      <div key={booking._id} className="border rounded-xl p-4">
                        <div className="flex justify-between">
                          <span className="font-semibold">{booking.bookingType}</span>
                          <span className="text-sm text-slate-500">{booking.status}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">{booking.origin} → {booking.destination}</div>
                        <div className="text-sm text-slate-600">Provider: {booking.provider}</div>
                        <div className="text-sm font-medium text-slate-800 mt-2">₹{booking.amount}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Expenses' && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-bold mb-4">Add expense</h3>
                <form onSubmit={createExpense} className="grid md:grid-cols-2 gap-3 mb-6">
                  <input name="title" value={form.expense.title} onChange={(e) => handleInput('expense', e)} placeholder="Expense title" className="border rounded-xl p-3 md:col-span-2" />
                  <input name="amount" value={form.expense.amount} onChange={(e) => handleInput('expense', e)} type="number" placeholder="Amount" className="border rounded-xl p-3" />
                  <select name="category" value={form.expense.category} onChange={(e) => handleInput('expense', e)} className="border rounded-xl p-3">
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Hotel</option>
                    <option>Activities</option>
                    <option>Shopping</option>
                    <option>Other</option>
                  </select>
                  <input name="date" value={form.expense.date} onChange={(e) => handleInput('expense', e)} type="date" className="border rounded-xl p-3 md:col-span-2" />
                  <textarea name="notes" value={form.expense.notes} onChange={(e) => handleInput('expense', e)} placeholder="Notes" className="border rounded-xl p-3 md:col-span-2" />
                  <button type="submit" className="bg-tripflow-600 text-white rounded-xl p-3 md:col-span-2">Add expense</button>
                </form>
                <div className="space-y-3">
                  {(trip.expenses || []).length === 0 ? (
                    <div className="text-slate-500">No expenses yet.</div>
                  ) : (
                    (trip.expenses || []).map((expense) => (
                      <div key={expense._id} className="border rounded-xl p-4 flex justify-between">
                        <div>
                          <div className="font-semibold">{expense.title}</div>
                          <div className="text-sm text-slate-500">{expense.category} • {expense.date}</div>
                        </div>
                        <div className="font-bold text-slate-800">₹{expense.amount}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Saved Places' && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-bold mb-4">Save a place</h3>
                <form onSubmit={createSavedPlace} className="grid md:grid-cols-2 gap-3 mb-6">
                  <input name="name" value={form.savedPlace.name} onChange={(e) => handleInput('savedPlace', e)} placeholder="Place name" className="border rounded-xl p-3 md:col-span-2" />
                  <input name="location" value={form.savedPlace.location} onChange={(e) => handleInput('savedPlace', e)} placeholder="Location" className="border rounded-xl p-3 md:col-span-2" />
                  <input name="category" value={form.savedPlace.category} onChange={(e) => handleInput('savedPlace', e)} placeholder="Category" className="border rounded-xl p-3 md:col-span-2" />
                  <textarea name="notes" value={form.savedPlace.notes} onChange={(e) => handleInput('savedPlace', e)} placeholder="Notes" className="border rounded-xl p-3 md:col-span-2" />
                  <button type="submit" className="bg-tripflow-600 text-white rounded-xl p-3 md:col-span-2">Save place</button>
                </form>
                <div className="space-y-3">
                  {(trip.savedPlaces || []).length === 0 ? (
                    <div className="text-slate-500">No saved places yet.</div>
                  ) : (
                    (trip.savedPlaces || []).map((place) => (
                      <div key={place._id} className="border rounded-xl p-4">
                        <div className="font-semibold">{place.name}</div>
                        <div className="text-sm text-slate-500">{place.category} • {place.location}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Checklist' && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Trip checklist</h3>
                  <span className="text-sm text-slate-500">{checklistProgress}% complete</span>
                </div>
                <form onSubmit={createChecklistItem} className="flex gap-3 mb-6">
                  <input name="text" value={form.checklist.text} onChange={(e) => handleInput('checklist', e)} placeholder="Add checklist item" className="flex-1 border rounded-xl p-3" />
                  <button type="submit" className="bg-tripflow-600 text-white rounded-xl px-4">Add</button>
                </form>
                <div className="space-y-3">
                  {(trip.checklist || []).length === 0 ? (
                    <div className="text-slate-500">No checklist items yet.</div>
                  ) : (
                    (trip.checklist || []).map((item) => (
                      <label key={item._id} className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer">
                        <input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(item._id, item.completed)} />
                        <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-700'}>{item.text}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Members' && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-bold mb-4">Trip members</h3>
                <div className="space-y-3">
                  {(trip.members || []).length === 0 ? (
                    <div className="text-slate-500">No members yet.</div>
                  ) : (
                    (trip.members || []).map((member) => (
                      <div key={member.user?._id || member.user} className="border rounded-xl p-4 flex justify-between">
                        <div>
                          <div className="font-semibold">{member.user?.name || 'Member'}</div>
                          <div className="text-sm text-slate-500">{member.user?.email}</div>
                        </div>
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs">{member.role}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-bold">Trip summary</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between"><span>Owner</span><span>{trip.owner?.name || 'You'}</span></div>
                <div className="flex justify-between"><span>Trips members</span><span>{trip.members?.length || 1}</span></div>
                <div className="flex justify-between"><span>Expenses</span><span>₹{totalExpenses}</span></div>
                <div className="flex justify-between"><span>Checklists</span><span>{trip.checklist?.length || 0}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-bold">Quick actions</h3>
              <div className="mt-4 grid gap-3">
                <Link className="bg-tripflow-100 text-tripflow-700 rounded-xl p-3 text-center font-medium" to="/flights">Search flights</Link>
                <button onClick={() => setActiveTab('Itinerary')} className="bg-slate-100 rounded-xl p-3 font-medium">Add itinerary</button>
                <button onClick={() => setActiveTab('Expenses')} className="bg-slate-100 rounded-xl p-3 font-medium">Track expenses</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-3 text-lg font-bold text-slate-800">{value}</div>
    </div>
  );
}
