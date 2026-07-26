import React, { useState, useEffect } from 'react';
import { useNotification } from './Notificationsystem';
import {
  Coffee, Plus, Edit2, Trash2, Save, X, Eye, EyeOff,
  Loader, AlertCircle, Check, Ban, Calendar, Store,
} from 'lucide-react';
import { API_BASE_URL as API_ROOT } from '../../lib/config';

interface Cafe {
  id: number;
  name: string;
  cuisine: string;
  description: string;
  area: string;
  address: string;
  image: string | null;
  rating: number;
  price_for_two: number;
  pure_veg: boolean;
  serves_alcohol: boolean;
  rooftop: boolean;
  has_table_booking: boolean;
  total_tables: number;
  opening_time: string;
  closing_time: string;
  is_verified: boolean;
  active: boolean;
  partner_name: string;
  partner_email: string;
  partner_phone: string;
}

interface CafeApplication {
  id: number;
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  area: string;
  cuisine: string;
  price_for_two: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
}

interface Booking {
  id: number;
  cafe_name: string;
  cafe_area: string;
  match: number;
  booked_by: string;
  date: string;
  time_slot: string;
  party_size: number;
  status: string;
  created_at: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Token ${token}`, 'Content-Type': 'application/json' };
};

const EMPTY_CAFE: Cafe = {
  id: 0, name: '', cuisine: '', description: '', area: '', address: '',
  image: null, rating: 4.0, price_for_two: 0,
  pure_veg: false, serves_alcohol: false, rooftop: false, has_table_booking: true,
  total_tables: 5, opening_time: '11:00', closing_time: '23:00',
  is_verified: true, active: true, partner_name: '', partner_email: '', partner_phone: '',
};

type Tab = 'cafes' | 'applications' | 'bookings';

const CafeManagement: React.FC = () => {
  const { showSuccess, showError, confirm } = useNotification();

  const [tab, setTab] = useState<Tab>('applications');
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [applications, setApplications] = useState<CafeApplication[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cafesRes, appsRes, bookingsRes] = await Promise.all([
        fetch(`${API_ROOT}/admin/cafes/`, { headers: getAuthHeaders() }),
        fetch(`${API_ROOT}/admin/cafe-applications/`, { headers: getAuthHeaders() }),
        fetch(`${API_ROOT}/admin/cafe-bookings/`, { headers: getAuthHeaders() }),
      ]);
      if (!cafesRes.ok || !appsRes.ok || !bookingsRes.ok) throw new Error('Failed to fetch cafe data');

      const asList = (data: any) => (Array.isArray(data) ? data : data.results || []);
      setCafes(asList(await cafesRes.json()));
      setApplications(asList(await appsRes.json()));
      setBookings(asList(await bookingsRes.json()));
    } catch (err) {
      console.error(err);
      setError('Failed to load cafe management data.');
      showError('Load Failed', 'Failed to load cafe management data.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- APPLICATIONS ---------------- */
  const handleApprove = (app: CafeApplication) => {
    confirm({
      title: 'Approve Application',
      message: `Approve "${app.business_name}"? This will create a public cafe listing.`,
      type: 'info',
      confirmText: 'Approve & List',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_ROOT}/admin/cafe-applications/${app.id}/approve/`, {
            method: 'POST',
            headers: getAuthHeaders(),
          });
          if (!res.ok) throw new Error();
          await fetchAll();
          showSuccess('Approved', `${app.business_name} is now listed publicly.`);
        } catch {
          showError('Failed', 'Could not approve this application.');
        }
      },
    });
  };

  const handleReject = (app: CafeApplication) => {
    confirm({
      title: 'Reject Application',
      message: `Reject "${app.business_name}"?`,
      type: 'danger',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_ROOT}/admin/cafe-applications/${app.id}/reject/`, {
            method: 'POST',
            headers: getAuthHeaders(),
          });
          if (!res.ok) throw new Error();
          await fetchAll();
          showSuccess('Rejected', `${app.business_name} has been rejected.`);
        } catch {
          showError('Failed', 'Could not reject this application.');
        }
      },
    });
  };

  /* ---------------- CAFES CRUD ---------------- */
  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingCafe({ ...EMPTY_CAFE });
  };

  const handleSaveCafe = async (cafe: Cafe) => {
    setIsSaving(true);
    try {
      const url = isCreating ? `${API_ROOT}/admin/cafes/` : `${API_ROOT}/admin/cafes/${cafe.id}/`;
      const method = isCreating ? 'POST' : 'PUT';
      const { image, ...body } = cafe; // image upload not wired here — set via Django admin
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(body) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }
      await fetchAll();
      setEditingCafe(null);
      setIsCreating(false);
      showSuccess(isCreating ? 'Cafe Created' : 'Cafe Updated', `${cafe.name} saved successfully.`);
    } catch (err) {
      console.error(err);
      showError('Save Failed', 'Please check the fields and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (cafe: Cafe) => {
    try {
      const res = await fetch(`${API_ROOT}/admin/cafes/${cafe.id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ active: !cafe.active }),
      });
      if (!res.ok) throw new Error();
      await fetchAll();
      showSuccess('Updated', `${cafe.name} is now ${!cafe.active ? 'active' : 'inactive'}.`);
    } catch {
      showError('Failed', 'Could not update this cafe.');
    }
  };

  const handleDeleteCafe = (cafe: Cafe) => {
    confirm({
      title: 'Delete Cafe',
      message: `Delete "${cafe.name}"? This cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_ROOT}/admin/cafes/${cafe.id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (!res.ok) throw new Error();
          await fetchAll();
          showSuccess('Deleted', `${cafe.name} has been removed.`);
        } catch {
          showError('Failed', 'Could not delete this cafe.');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading cafe management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">
          Try Again
        </button>
      </div>
    );
  }

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {([
          ['applications', `Partner Applications${pendingCount ? ` (${pendingCount})` : ''}`],
          ['cafes', 'Listed Cafes'],
          ['bookings', 'Bookings'],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
              tab === id ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Applications */}
      {tab === 'applications' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Partner Applications</h3>
          {applications.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{app.business_name}</h4>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        app.status === 'pending' ? 'bg-amber-100 text-amber-700'
                        : app.status === 'approved' ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{app.contact_name} · {app.contact_email} · {app.contact_phone}</p>
                    <p className="text-sm text-gray-500">{app.area} · {app.cuisine} · ₹{app.price_for_two} for two</p>
                    {app.description && <p className="text-sm text-gray-600 mt-1">{app.description}</p>}
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleApprove(app)} className="p-2 text-green-600 border border-green-200 hover:bg-green-50 rounded-lg transition" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleReject(app)} className="p-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition" title="Reject">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cafes */}
      {tab === 'cafes' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Listed Cafes</h3>
                <p className="text-sm text-gray-600">{cafes.length} cafe(s) · {cafes.filter((c) => c.active).length} active</p>
              </div>
            </div>
            <button onClick={handleCreateNew} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition font-semibold">
              <Plus className="w-4 h-4" />
              Add Cafe
            </button>
          </div>

          {cafes.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No cafes listed yet — approve an application or add one directly.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {cafes.map((cafe) => (
                <div key={cafe.id} className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-gray-900">{cafe.name}</h4>
                      {!cafe.active && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">Inactive</span>}
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">★ {cafe.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500">{cafe.area} · {cafe.cuisine} · ₹{cafe.price_for_two} for two · {cafe.total_tables} tables</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setEditingCafe(cafe); setIsCreating(false); }} className="p-2 text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggleActive(cafe)} className={`p-2 border rounded-lg transition ${cafe.active ? 'text-gray-600 border-gray-200 hover:bg-gray-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`} title={cafe.active ? 'Deactivate' : 'Activate'}>
                      {cafe.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDeleteCafe(cafe)} className="p-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" /> All Bookings
          </h3>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="py-2 pr-4">Cafe</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Party</th>
                    <th className="py-2 pr-4">Booked By</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4">{b.cafe_name} <span className="text-gray-400">({b.cafe_area})</span></td>
                      <td className="py-2 pr-4">{b.date}</td>
                      <td className="py-2 pr-4">{b.time_slot}</td>
                      <td className="py-2 pr-4">{b.party_size}</td>
                      <td className="py-2 pr-4">{b.booked_by}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700'
                          : b.status === 'cancelled' ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit/Create Cafe Modal */}
      {editingCafe && (
        <CafeEditModal
          cafe={editingCafe}
          isCreating={isCreating}
          isSaving={isSaving}
          onSave={handleSaveCafe}
          onCancel={() => { setEditingCafe(null); setIsCreating(false); }}
          onChange={setEditingCafe}
        />
      )}
    </div>
  );
};

const CafeEditModal: React.FC<{
  cafe: Cafe;
  isCreating: boolean;
  isSaving: boolean;
  onSave: (cafe: Cafe) => void;
  onCancel: () => void;
  onChange: (cafe: Cafe) => void;
}> = ({ cafe, isCreating, isSaving, onSave, onCancel, onChange }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{isCreating ? 'Add Cafe' : 'Edit Cafe'}</h2>
          <button onClick={onCancel} disabled={isSaving} className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
            <input type="text" value={cafe.name} onChange={(e) => onChange({ ...cafe, name: e.target.value })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cuisine</label>
              <input type="text" value={cafe.cuisine} onChange={(e) => onChange({ ...cafe, cuisine: e.target.value })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Area</label>
              <input type="text" value={cafe.area} onChange={(e) => onChange({ ...cafe, area: e.target.value })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <input type="text" value={cafe.address} onChange={(e) => onChange({ ...cafe, address: e.target.value })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea value={cafe.description} onChange={(e) => onChange({ ...cafe, description: e.target.value })} disabled={isSaving} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
              <input type="number" step="0.1" min="0" max="5" value={cafe.rating} onChange={(e) => onChange({ ...cafe, rating: parseFloat(e.target.value) || 0 })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price for two (₹)</label>
              <input type="number" value={cafe.price_for_two} onChange={(e) => onChange({ ...cafe, price_for_two: parseInt(e.target.value) || 0 })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Tables</label>
              <input type="number" value={cafe.total_tables} onChange={(e) => onChange({ ...cafe, total_tables: parseInt(e.target.value) || 0 })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Opens at</label>
              <input type="time" value={cafe.opening_time} onChange={(e) => onChange({ ...cafe, opening_time: e.target.value })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Closes at</label>
              <input type="time" value={cafe.closing_time} onChange={(e) => onChange({ ...cafe, closing_time: e.target.value })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {([
              ['pure_veg', 'Pure Veg'],
              ['serves_alcohol', 'Serves Alcohol'],
              ['rooftop', 'Rooftop'],
              ['has_table_booking', 'Table Booking'],
              ['active', 'Active'],
            ] as [keyof Cafe, string][]).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(cafe[key])}
                  onChange={(e) => onChange({ ...cafe, [key]: e.target.checked })}
                  disabled={isSaving}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Partner Name</label>
              <input type="text" value={cafe.partner_name} onChange={(e) => onChange({ ...cafe, partner_name: e.target.value })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Partner Email</label>
              <input type="email" value={cafe.partner_email} onChange={(e) => onChange({ ...cafe, partner_email: e.target.value })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Partner Phone</label>
              <input type="text" value={cafe.partner_phone} onChange={(e) => onChange({ ...cafe, partner_phone: e.target.value })} disabled={isSaving} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(cafe)} disabled={isSaving || !cafe.name} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white h-12 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50">
            {isSaving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {isCreating ? 'Create Cafe' : 'Save Changes'}</>}
          </button>
          <button onClick={onCancel} disabled={isSaving} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CafeManagement;
