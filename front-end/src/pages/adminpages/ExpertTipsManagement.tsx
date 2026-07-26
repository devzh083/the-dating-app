import React, { useState, useEffect } from 'react';
import {
  Lightbulb, Plus, Edit2, Trash2, Save, X, Eye, EyeOff,
  Loader, AlertCircle, MessageCircle, Target, Sparkles,
  Heart, Star, Zap, Users, TrendingUp
} from 'lucide-react';
import { useNotification } from './Notificationsystem';
import { API_BASE_URL as API_ROOT } from '../../lib/config';

interface ExpertTip {
  id: number;
  name: string;
  role: string;
  image: string;
  tip: string;
  icon: string;
  icon_color: string;
  bg_color: string;
  active: boolean;
  display_order: number;
}

const ICON_OPTIONS = [
  { value: 'message-circle', label: 'Message Circle', icon: MessageCircle },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'lightbulb', label: 'Lightbulb', icon: Lightbulb },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'trending-up', label: 'Trending Up', icon: TrendingUp },
];

const COLOR_OPTIONS = [
  { value: 'text-blue-500', label: 'Blue', preview: 'bg-blue-500' },
  { value: 'text-rose-500', label: 'Rose', preview: 'bg-rose-500' },
  { value: 'text-amber-500', label: 'Amber', preview: 'bg-amber-500' },
  { value: 'text-violet-500', label: 'Violet', preview: 'bg-violet-500' },
  { value: 'text-green-500', label: 'Green', preview: 'bg-green-500' },
  { value: 'text-purple-500', label: 'Purple', preview: 'bg-purple-500' },
  { value: 'text-pink-500', label: 'Pink', preview: 'bg-pink-500' },
  { value: 'text-teal-500', label: 'Teal', preview: 'bg-teal-500' },
];

const BG_OPTIONS = [
  { value: 'bg-blue-50', label: 'Blue', preview: 'bg-blue-50' },
  { value: 'bg-rose-50', label: 'Rose', preview: 'bg-rose-50' },
  { value: 'bg-amber-50', label: 'Amber', preview: 'bg-amber-50' },
  { value: 'bg-violet-50', label: 'Violet', preview: 'bg-violet-50' },
  { value: 'bg-green-50', label: 'Green', preview: 'bg-green-50' },
  { value: 'bg-purple-50', label: 'Purple', preview: 'bg-purple-50' },
  { value: 'bg-pink-50', label: 'Pink', preview: 'bg-pink-50' },
  { value: 'bg-teal-50', label: 'Teal', preview: 'bg-teal-50' },
];

const ExpertTipsManagement: React.FC = () => {
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  
  const [tips, setTips] = useState<ExpertTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTip, setEditingTip] = useState<ExpertTip | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        const errorMsg = 'No authentication token found';
        setError(errorMsg);
        showError('Authentication Error', errorMsg);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_ROOT}/admin/expert-tips/`, {
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expert tips');
      }

      const data = await response.json();
      const processedTips = Array.isArray(data) ? data : data.results || [];
      setTips(processedTips);
    } catch (err) {
      console.error('Error fetching expert tips:', err);
      const errorMsg = 'Failed to load expert tips. Please try again.';
      setError(errorMsg);
      showError('Load Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const validateTip = (tip: ExpertTip): string[] => {
    const errors: string[] = [];

    if (!tip.name || tip.name.trim() === '') {
      errors.push('Expert name is required');
    }

    if (!tip.role || tip.role.trim() === '') {
      errors.push('Expert role is required');
    }

    if (!tip.image || tip.image.trim() === '') {
      errors.push('Expert image URL is required');
    } else if (!tip.image.match(/^https?:\/\/.+/)) {
      errors.push('Image URL must start with http:// or https://');
    }

    if (!tip.tip || tip.tip.trim() === '') {
      errors.push('Tip text is required');
    }

    return errors;
  };

  const handleSaveTip = async (tip: ExpertTip) => {
    const errors = validateTip(tip);
    if (errors.length > 0) {
      setValidationErrors(errors);
      showWarning('Validation Failed', 'Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = isCreating
        ? `${API_ROOT}/admin/expert-tips/`
        : `${API_ROOT}/admin/expert-tips/${tip.id}/`;
      
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tip),
      });

      if (response.ok) {
        await fetchTips();
        setEditingTip(null);
        setIsCreating(false);
        setValidationErrors([]);
        showSuccess(
          isCreating ? 'Tip Created' : 'Tip Updated',
          isCreating 
            ? `Expert tip for ${tip.name} has been created successfully`
            : `Expert tip for ${tip.name} has been updated`
        );
      } else {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
    } catch (err) {
      console.error('Error saving tip:', err);
      showError(
        isCreating ? 'Create Failed' : 'Update Failed',
        'Failed to save the expert tip. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTip = (tip: ExpertTip) => {
    confirm({
      title: 'Delete Expert Tip',
      message: `Are you sure you want to delete the tip from ${tip.name}?\n\nThis action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete Tip',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const response = await fetch(
            `${API_ROOT}/admin/expert-tips/${tip.id}/`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Token ${token}` },
            }
          );

          if (response.ok) {
            await fetchTips();
            showSuccess('Tip Deleted', `Tip from ${tip.name} has been removed`);
          } else {
            throw new Error('Failed to delete tip');
          }
        } catch (err) {
          console.error('Error deleting tip:', err);
          showError('Delete Failed', 'Failed to delete the expert tip');
        }
      }
    });
  };

  const handleToggleTipActive = async (tip: ExpertTip) => {
    const action = tip.active ? 'deactivate' : 'activate';
    
    confirm({
      title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Tip`,
      message: `Are you sure you want to ${action} the tip from ${tip.name}?`,
      type: 'info',
      confirmText: action === 'activate' ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const response = await fetch(
            `${API_ROOT}/admin/expert-tips/${tip.id}/toggle_active/`,
            {
              method: 'POST',
              headers: { 'Authorization': `Token ${token}` },
            }
          );
          
          if (response.ok) {
            await fetchTips();
            showSuccess(
              'Status Updated',
              `Tip from ${tip.name} has been ${action}d`
            );
          } else {
            throw new Error('Failed to toggle tip status');
          }
        } catch (err) {
          console.error('Error toggling tip:', err);
          showError('Toggle Failed', 'Failed to update tip status');
        }
      }
    });
  };

  const handleCreateNewTip = () => {
    setIsCreating(true);
    setValidationErrors([]);
    setEditingTip({
      id: 0,
      name: '',
      role: '',
      image: '',
      tip: '',
      icon: 'lightbulb',
      icon_color: 'text-blue-500',
      bg_color: 'bg-blue-50',
      active: true,
      display_order: tips.length,
    });
  };

  const handleCancelEdit = () => {
    if (isCreating || validationErrors.length > 0) {
      confirm({
        title: 'Discard Changes',
        message: 'Are you sure you want to discard your changes?',
        type: 'warning',
        confirmText: 'Discard',
        cancelText: 'Continue Editing',
        onConfirm: () => {
          setEditingTip(null);
          setIsCreating(false);
          setValidationErrors([]);
        }
      });
    } else {
      setEditingTip(null);
      setIsCreating(false);
      setValidationErrors([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading expert tips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Tips</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchTips}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Expert Tips</h3>
              <p className="text-sm text-gray-600">
                {tips.length} tip(s) • {tips.filter(t => t.active).length} active
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateNewTip}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Tip
          </button>
        </div>

        {tips.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No expert tips yet</p>
            <button
              onClick={handleCreateNewTip}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-semibold"
            >
              Create Your First Tip
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tips.map((tip) => (
              <TipCard
                key={tip.id}
                tip={tip}
                onEdit={() => {
                  setEditingTip(tip);
                  setValidationErrors([]);
                  setIsCreating(false);
                }}
                onDelete={() => handleDeleteTip(tip)}
                onToggleActive={() => handleToggleTipActive(tip)}
              />
            ))}
          </div>
        )}
      </div>

      {editingTip && (
        <TipEditModal
          tip={editingTip}
          isCreating={isCreating}
          isSaving={isSaving}
          onSave={handleSaveTip}
          onCancel={handleCancelEdit}
          onChange={setEditingTip}
          validationErrors={validationErrors}
        />
      )}
    </div>
  );
};

// Tip Card Component
const TipCard: React.FC<{
  tip: ExpertTip;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}> = ({ tip, onEdit, onDelete, onToggleActive }) => {
  const IconComponent = ICON_OPTIONS.find(opt => opt.value === tip.icon)?.icon || Lightbulb;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          <img 
            src={tip.image} 
            alt={tip.name} 
            className="w-16 h-16 rounded-full border border-gray-200 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Expert';
            }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900">{tip.name}</h3>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                {tip.role}
              </span>
              {!tip.active && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                  Inactive
                </span>
              )}
            </div>

            <p className="text-sm text-gray-700 mb-3 italic">"{tip.tip}"</p>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <IconComponent className={`w-4 h-4 ${tip.icon_color}`} />
                <span>{tip.icon}</span>
              </div>
              <span>Order: {tip.display_order}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
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
              tip.active 
                ? 'text-gray-600 border-gray-200 hover:bg-gray-50' 
                : 'text-green-600 border-green-200 hover:bg-green-50'
            }`}
            title={tip.active ? 'Deactivate' : 'Activate'}
          >
            {tip.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
    </div>
  );
};

// Tip Edit Modal Component
const TipEditModal: React.FC<{
  tip: ExpertTip;
  isCreating: boolean;
  isSaving: boolean;
  onSave: (tip: ExpertTip) => void;
  onCancel: () => void;
  onChange: (tip: ExpertTip) => void;
  validationErrors: string[];
}> = ({ tip, isCreating, isSaving, onSave, onCancel, onChange, validationErrors }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isCreating ? 'Create New Expert Tip' : 'Edit Expert Tip'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Expert Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expert Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tip.name}
              onChange={(e) => onChange({ ...tip, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Dr. Alex Rivera"
              required
              disabled={isSaving}
            />
          </div>

          {/* Expert Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expert Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tip.role}
              onChange={(e) => onChange({ ...tip, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Relationship Psychologist"
              required
              disabled={isSaving}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={tip.image}
              onChange={(e) => onChange({ ...tip, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="https://i.pravatar.cc/150?img=11"
              required
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500 mt-1">
              Suggested: https://i.pravatar.cc/150?img=XX (replace XX with a number)
            </p>
            {tip.image && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Preview:</p>
                <img 
                  src={tip.image} 
                  alt="Preview" 
                  className="w-20 h-20 rounded-full border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid';
                  }}
                />
              </div>
            )}
          </div>

          {/* Tip Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expert Tip <span className="text-red-500">*</span>
            </label>
            <textarea
              value={tip.tip}
              onChange={(e) => onChange({ ...tip, tip: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter the expert tip..."
              rows={3}
              required
              disabled={isSaving}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ICON_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange({ ...tip, icon: option.value })}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      tip.icon === option.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-300 hover:border-teal-300 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Icon Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ ...tip, icon_color: option.value })}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    tip.icon_color === option.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${option.preview}`} />
                  <span className="text-xs font-medium text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Background Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BG_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ ...tip, bg_color: option.value })}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    tip.bg_color === option.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded ${option.preview}`} />
                  <span className="text-xs font-medium text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={tip.display_order}
              onChange={(e) => onChange({ ...tip, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              min="0"
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first in the list
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(tip)}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white h-12 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {isCreating ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isCreating ? 'Create Tip' : 'Save Changes'}
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertTipsManagement;