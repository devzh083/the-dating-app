import React, { useState, useEffect } from 'react';
import {
  Ticket, Plus, Edit2, Trash2, Save, X, Eye, EyeOff,
  Users, Calendar, TrendingUp, Loader, AlertCircle, Check,
  Copy, ExternalLink, BarChart3, Clock, Tag
} from 'lucide-react';
import { useNotification } from './Notificationsystem';
import { API_BASE_URL as API_ROOT } from '../../lib/config';

// ─── Types ────────────────────────────────────────────────────────────────

interface PromoCode {
  id: number;
  code: string;
  description: string;
  discount_percentage: number;
  plan: string;
  plan_name: string;
  plan_price: number;
  max_uses: number;
  current_uses: number;
  remaining_uses: number;
  usage_percentage: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  is_valid: boolean;
  created_by_username: string | null;
  created_at: string;
  updated_at: string;
  recent_usages: PromoUsage[];
}

interface PromoUsage {
  id: number;
  username: string;
  user_email: string;
  plan_name: string;
  used_at: string;
}

interface PremiumPlan {
  plan_id: string;
  name: string;
  price: number;
  active: boolean;
}

// ─── API Configuration ────────────────────────────────────────────────────

const API_BASE_URL = `${API_ROOT}/admin`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
  };
};

// ─── Modal Components ─────────────────────────────────────────────────────

const PromoCodeModal: React.FC<{
  promo: Partial<PromoCode> | null;
  plans: PremiumPlan[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  isCreating: boolean;
}> = ({ promo, plans, onSave, onCancel, isCreating }) => {
  const [code, setCode] = useState(promo?.code || '');
  const [description, setDescription] = useState(promo?.description || '');
  const [planId, setPlanId] = useState(promo?.plan || '');
  const [discountPercentage, setDiscountPercentage] = useState(promo?.discount_percentage || 100);
  const [maxUses, setMaxUses] = useState(promo?.max_uses || 100);
  const [validFrom, setValidFrom] = useState(
    promo?.valid_from ? new Date(promo.valid_from).toISOString().slice(0, 16) : 
    new Date().toISOString().slice(0, 16)
  );
  const [validUntil, setValidUntil] = useState(
    promo?.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 16) : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    // Validation
    if (!code.trim()) {
      setError('Code is required');
      return;
    }
    if (!planId) {
      setError('Please select a plan');
      return;
    }
    if (maxUses < 1) {
      setError('Max uses must be at least 1');
      return;
    }
    if (discountPercentage < 0 || discountPercentage > 100) {
      setError('Discount must be between 0 and 100');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({
        code: code.trim().toUpperCase(),
        description: description.trim(),
        plan: planId,
        discount_percentage: discountPercentage,
        max_uses: maxUses,
        valid_from: validFrom,
        valid_until: validUntil || null,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save promo code');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">
            {isCreating ? 'Create Promo Code' : 'Edit Promo Code'}
          </h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Promo Code *
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              disabled={!isCreating || saving}
              placeholder="e.g., SUMMER100, FREEMONTH"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 disabled:bg-gray-100 font-mono"
            />
            {isCreating && (
              <p className="text-xs text-gray-500 mt-1">
                Use uppercase letters, numbers, hyphens, and underscores
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Internal)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={saving}
              placeholder="Internal note about this promo code..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Plan *
            </label>
            <select
              value={planId}
              onChange={e => setPlanId(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            >
              <option value="">Select a plan</option>
              {plans.filter(p => p.active).map(plan => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.name} - ₹{plan.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Discount & Max Uses */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount % *
              </label>
              <input
                type="number"
                value={discountPercentage}
                onChange={e => setDiscountPercentage(parseInt(e.target.value) || 0)}
                disabled={saving}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                100% = FREE plan
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Uses *
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={e => setMaxUses(parseInt(e.target.value) || 1)}
                disabled={saving}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of people who can use this
              </p>
            </div>
          </div>

          {/* Valid From & Until */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valid From *
              </label>
              <input
                type="datetime-local"
                value={validFrom}
                onChange={e => setValidFrom(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valid Until (Optional)
              </label>
              <input
                type="datetime-local"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for no expiration
              </p>
            </div>
          </div>

          {/* Preview */}
          {planId && (
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-semibold text-teal-900">Preview</span>
              </div>
              <p className="text-2xl font-black text-teal-600 mb-1">
                {code || 'CODE'} 
              </p>
              <p className="text-sm text-teal-700">
                {discountPercentage}% off {plans.find(p => p.plan_id === planId)?.name}
                {discountPercentage === 100 && ' (FREE!)'}
              </p>
              <p className="text-xs text-teal-600 mt-2">
                Max {maxUses} {maxUses === 1 ? 'person' : 'people'}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : isCreating ? 'Create Code' : 'Save Changes'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Promo Code Card ──────────────────────────────────────────────────────

const PromoCodeCard: React.FC<{
  promo: PromoCode;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onViewUsages: () => void;
}> = ({ promo, onEdit, onDelete, onToggleActive, onViewUsages }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    if (!promo.active) return 'bg-gray-100 text-gray-600';
    if (!promo.is_valid) return 'bg-red-100 text-red-700';
    if (promo.remaining_uses === 0) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = () => {
    if (!promo.active) return 'Inactive';
    if (!promo.is_valid && promo.remaining_uses === 0) return 'Used Up';
    if (!promo.is_valid) return 'Expired';
    return 'Active';
  };

  return (
    <div className={`bg-white rounded-xl border-2 p-5 transition-all ${
      promo.active && promo.is_valid ? 'border-teal-200 hover:shadow-lg' : 'border-gray-200 opacity-75'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition font-mono font-bold text-lg group"
            >
              {promo.code}
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              )}
            </button>
            <span className={`px-2 py-1 ${getStatusColor()} text-xs font-bold rounded-full`}>
              {getStatusText()}
            </span>
            {promo.discount_percentage === 100 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                FREE
              </span>
            )}
          </div>
          
          {promo.description && (
            <p className="text-sm text-gray-600 mb-2">{promo.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4 text-teal-500" />
              {promo.plan_name}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              {promo.discount_percentage}% off
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleActive}
            className={`p-2 border rounded-lg transition ${
              promo.active ? 'text-gray-600 border-gray-200 hover:bg-gray-50' : 'text-green-600 border-green-200 hover:bg-green-50'
            }`}
            title={promo.active ? 'Deactivate' : 'Activate'}
          >
            {promo.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 font-medium">Usage</span>
          <span className="text-gray-900 font-bold">
            {promo.current_uses} / {promo.max_uses}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all rounded-full ${
              promo.usage_percentage >= 100 ? 'bg-red-500' :
              promo.usage_percentage >= 75 ? 'bg-orange-500' :
              'bg-teal-500'
            }`}
            style={{ width: `${Math.min(promo.usage_percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {promo.remaining_uses} {promo.remaining_uses === 1 ? 'use' : 'uses'} remaining
        </p>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Valid from {new Date(promo.valid_from).toLocaleDateString()}</span>
        </div>
        {promo.valid_until ? (
          <span>Until {new Date(promo.valid_until).toLocaleDateString()}</span>
        ) : (
          <span>No expiration</span>
        )}
      </div>

      {/* View Usages Button */}
      {promo.current_uses > 0 && (
        <button
          onClick={onViewUsages}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition text-sm font-semibold"
        >
          <Users className="w-4 h-4" />
          View {promo.current_uses} {promo.current_uses === 1 ? 'User' : 'Users'}
        </button>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────

const PromoCodeManagement: React.FC = () => {
  const { showSuccess, showError, confirm } = useNotification();

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filters
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchData();
  }, [filterActive]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filterActive !== 'all') {
        params.append('active', filterActive === 'active' ? 'true' : 'false');
      }

      const [promoRes, plansRes] = await Promise.all([
        fetch(`${API_BASE_URL}/promo-codes/?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/premium/plans/`, { headers: getAuthHeaders() }),
      ]);

      console.log('📊 Promo Response Status:', promoRes.status);
      console.log('📊 Plans Response Status:', plansRes.status);

      if (promoRes.ok && plansRes.ok) {
        const promoData = await promoRes.json();
        const plansData = await plansRes.json();

        console.log('📦 Raw Promo Data:', promoData);
        console.log('📦 Raw Plans Data:', plansData);

        // Handle different response formats for promo codes
        let processedPromos: PromoCode[] = [];
        if (Array.isArray(promoData)) {
          processedPromos = promoData;
        } else if (promoData?.results) {
          processedPromos = promoData.results;
        } else if (promoData?.data) {
          processedPromos = promoData.data;
        }

        // Handle different response formats for plans
        let processedPlans: PremiumPlan[] = [];
        if (Array.isArray(plansData)) {
          processedPlans = plansData;
        } else if (plansData?.results) {
          processedPlans = plansData.results;
        } else if (plansData?.data) {
          processedPlans = plansData.data;
        }

        // Ensure numeric fields are properly typed
        processedPlans = processedPlans.map(plan => ({
          ...plan,
          price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
          active: Boolean(plan.active),
        }));

        console.log('✅ Processed Promo Codes:', processedPromos.length);
        console.log('✅ Processed Plans:', processedPlans.length);
        console.log('✅ Active Plans:', processedPlans.filter(p => p.active).length);

        setPromoCodes(processedPromos);
        setPlans(processedPlans);
      } else {
        const promoError = !promoRes.ok ? await promoRes.text() : '';
        const plansError = !plansRes.ok ? await plansRes.text() : '';
        
        console.error('❌ Promo fetch failed:', promoError);
        console.error('❌ Plans fetch failed:', plansError);
        
        showError('Failed to load data. Check console for details.');
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      showError('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePromo = async (data: any) => {
    try {
      const url = editingPromo
        ? `${API_BASE_URL}/promo-codes/${editingPromo.id}/`
        : `${API_BASE_URL}/promo-codes/`;
      
      const method = editingPromo ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchData();
        setModalOpen(false);
        setEditingPromo(null);
        setIsCreating(false);
        showSuccess(editingPromo ? 'Promo code updated' : 'Promo code created');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save promo code');
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeletePromo = (promo: PromoCode) => {
    confirm({
      title: `Delete ${promo.code}?`,
      message: `Are you sure you want to delete this promo code? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/promo-codes/${promo.id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (response.ok || response.status === 204) {
            await fetchData();
            showSuccess('Promo code deleted');
          }
        } catch (err) {
          showError('Failed to delete promo code');
        }
      },
    });
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/promo-codes/${promo.id}/toggle_active/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await fetchData();
        showSuccess(`Promo code ${promo.active ? 'deactivated' : 'activated'}`);
      }
    } catch (err) {
      showError('Failed to toggle promo code');
    }
  };

  const handleViewUsages = (promo: PromoCode) => {
    // Could open a modal with usage details
    alert(`${promo.code} has been used ${promo.current_uses} times.\n\nRecent users:\n${
      promo.recent_usages.map(u => `- ${u.username} (${u.user_email})`).join('\n')
    }`);
  };

  const filteredPromoCodes = promoCodes;

  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter(p => p.active && p.is_valid).length,
    inactive: promoCodes.filter(p => !p.active).length,
    usedUp: promoCodes.filter(p => p.remaining_uses === 0).length,
    totalRedemptions: promoCodes.reduce((sum, p) => sum + p.current_uses, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Codes', value: stats.total, color: 'bg-blue-50 text-blue-600', icon: Ticket },
          { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-600', icon: Check },
          { label: 'Inactive', value: stats.inactive, color: 'bg-gray-50 text-gray-600', icon: EyeOff },
          { label: 'Used Up', value: stats.usedUp, color: 'bg-orange-50 text-orange-600', icon: Users },
          { label: 'Total Uses', value: stats.totalRedemptions, color: 'bg-purple-50 text-purple-600', icon: TrendingUp },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.color} rounded-xl px-4 py-3`}>
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <span className="text-2xl font-black">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterActive(filter)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterActive === filter
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingPromo(null);
            setIsCreating(true);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Promo Code
        </button>
      </div>

      {/* Promo Codes Grid */}
      {filteredPromoCodes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-14 text-center">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No promo codes yet</p>
          <button
            onClick={() => {
              setEditingPromo(null);
              setIsCreating(true);
              setModalOpen(true);
            }}
            className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-semibold"
          >
            Create Your First Code
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromoCodes.map((promo) => (
            <PromoCodeCard
              key={promo.id}
              promo={promo}
              onEdit={() => {
                setEditingPromo(promo);
                setIsCreating(false);
                setModalOpen(true);
              }}
              onDelete={() => handleDeletePromo(promo)}
              onToggleActive={() => handleToggleActive(promo)}
              onViewUsages={() => handleViewUsages(promo)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <PromoCodeModal
          promo={editingPromo}
          plans={plans}
          onSave={handleSavePromo}
          onCancel={() => {
            setModalOpen(false);
            setEditingPromo(null);
            setIsCreating(false);
          }}
          isCreating={isCreating}
        />
      )}
    </div>
  );
};

export default PromoCodeManagement;