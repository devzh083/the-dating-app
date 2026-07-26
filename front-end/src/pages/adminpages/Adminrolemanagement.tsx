import React, { useState, useEffect } from 'react';
import {
  UserPlus, Shield, Edit2, Trash2, Save, X,
  Loader, AlertCircle, AlertTriangle, Check, ChevronDown, ChevronUp,
  Eye, EyeOff, Users, BarChart3, FileText,
  Crown, Lightbulb, Quote, Lock, Copy, CheckCircle, Key, Coffee
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';
import { API_BASE_URL as API_ROOT } from '../../lib/config';

// ─── Types ────────────────────────────────────────────────────────────────

type PermissionLevel = 'none' | 'view' | 'edit';

const SECTIONS = [
  { id: 'overview',     label: 'Overview',        icon: BarChart3,  color: 'text-blue-500',   bg: 'bg-blue-50' },
  { id: 'users',        label: 'User Management', icon: Users,      color: 'text-teal-500',   bg: 'bg-teal-50' },
  { id: 'reports',      label: 'Reports',         icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'analytics',    label: 'Admin Actions',   icon: FileText,   color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'premium',      label: 'Premium',         icon: Crown,      color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'expert-tips',  label: 'Expert Tips',     icon: Lightbulb,  color: 'text-amber-500',  bg: 'bg-amber-50' },
  { id: 'reviews',      label: 'Reviews',         icon: Quote,      color: 'text-rose-500',   bg: 'bg-rose-50' },
  { id: 'cafes',        label: 'Cafes',           icon: Coffee,     color: 'text-orange-500', bg: 'bg-orange-50' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

type SectionPermissions = { [K in SectionId]: PermissionLevel };

interface AdminRole {
  id: number;
  email: string;
  username: string;
  role_name: string;
  is_super_admin: boolean;
  is_active: boolean;
  permissions: SectionPermissions;
  created_at: string;
  last_login: string | null;
  invite_token: string | null;
  invite_accepted: boolean;
  initial_password?: string; // ✅ NEW: Add password field
  password_changed?: boolean; // ✅ NEW: Track if password was changed
}

// ─── API Configuration ────────────────────────────────────────────────────

const API_BASE_URL = `${API_ROOT}/admin/admin-roles/`;

const getAuthHeaders = () => {
  return adminService.getAdminHeaders();
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const emptyPermissions = (): SectionPermissions => ({
  overview: 'none', users: 'none', reports: 'none', analytics: 'none',
  premium: 'none', 'expert-tips': 'none', reviews: 'none', cafes: 'none',
});

const allViewPermissions = (): SectionPermissions => ({
  overview: 'view', users: 'view', reports: 'view', analytics: 'view',
  premium: 'view', 'expert-tips': 'view', reviews: 'view', cafes: 'view',
});

const allEditPermissions = (): SectionPermissions => ({
  overview: 'edit', users: 'edit', reports: 'edit', analytics: 'edit',
  premium: 'edit', 'expert-tips': 'edit', reviews: 'edit', cafes: 'edit',
});

const countPermissions = (perms: SectionPermissions) => {
  const vals = Object.values(perms);
  return { 
    view: vals.filter(v => v === 'view').length, 
    edit: vals.filter(v => v === 'edit').length, 
    none: vals.filter(v => v === 'none').length 
  };
};

// ─── Password Display Modal ───────────────────────────────────────────────

const PasswordModal: React.FC<{
  email: string;
  username: string;
  password: string;
  onClose: () => void;
}> = ({ email, username, password, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Account Created!</h2>
              <p className="text-sm text-teal-50">Save these credentials now</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Important - Save This Password!</p>
              <p className="text-xs text-amber-700">
                This password will be visible in the admin card until they change it on first login.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Username
              </label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{username}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Temporary Password
              </label>
              <div className="relative">
                <div className="px-4 py-2.5 pr-12 bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-lg">
                  <p className="text-sm font-mono font-bold text-teal-900 break-all">{password}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg border border-teal-200 hover:bg-teal-50 transition"
                  title="Copy password"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-teal-600" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Password copied to clipboard!
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs text-blue-800">
              <strong>Next steps:</strong> The admin can log in with these credentials. 
              You can view this password anytime by clicking on their admin card until they change it.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition shadow-sm"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-Components ───────────────────────────────────────────────────────

const PermissionPill: React.FC<{ level: PermissionLevel; compact?: boolean }> = ({ level, compact }) => {
  const styles: Record<PermissionLevel, string> = {
    none:  'bg-gray-100 text-gray-500',
    view:  'bg-sky-100 text-sky-700',
    edit:  'bg-emerald-100 text-emerald-700',
  };
  const Icon = level === 'none' ? Lock : level === 'view' ? Eye : Edit2;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[level]}`}>
      <Icon className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
      {level === 'none' ? 'No Access' : level === 'view' ? 'View' : 'Edit'}
    </span>
  );
};

const PermissionToggle: React.FC<{
  level: PermissionLevel;
  onChange: (level: PermissionLevel) => void;
  disabled?: boolean;
}> = ({ level, onChange, disabled }) => {
  const levels: PermissionLevel[] = ['none', 'view', 'edit'];
  return (
    <div className="flex gap-1">
      {levels.map(l => {
        const active = level === l;
        const base = 'px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 border ';
        const activeStyles: Record<PermissionLevel, string> = {
          none:  'bg-gray-200 text-gray-700 border-gray-300',
          view:  'bg-sky-500 text-white border-sky-500',
          edit:  'bg-emerald-500 text-white border-emerald-500',
        };
        const inactiveStyles: Record<PermissionLevel, string> = {
          none:  'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
          view:  'bg-white text-sky-600 border-gray-200 hover:border-sky-300',
          edit:  'bg-white text-emerald-600 border-gray-200 hover:border-emerald-300',
        };
        return (
          <button
            key={l}
            type="button"
            onClick={() => !disabled && onChange(l)}
            disabled={disabled}
            className={`${base} ${active ? activeStyles[l] : inactiveStyles[l]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {l === 'none' ? '—' : l === 'view' ? 'View' : 'Edit'}
          </button>
        );
      })}
    </div>
  );
};

// ─── Modal: Create / Edit Admin ───────────────────────────────────────────

const AdminModal: React.FC<{
  admin: AdminRole | null;
  isCreating: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}> = ({ admin, isCreating, onSave, onCancel }) => {
  const [email, setEmail]           = useState(admin?.email || '');
  const [username, setUsername]     = useState(admin?.username || '');
  const [roleName, setRoleName]     = useState(admin?.role_name || '');
  const [permissions, setPermissions] = useState<SectionPermissions>(
    admin?.permissions || emptyPermissions()
  );
  const [errors, setErrors]         = useState<string[]>([]);
  const [saving, setSaving]         = useState(false);

  const validate = () => {
    const errs: string[] = [];
    if (!email.trim())    errs.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push('Invalid email format');
    if (isCreating && !username.trim()) errs.push('Username is required');
    if (!roleName.trim()) errs.push('Role name is required');
    const p = countPermissions(permissions);
    if (p.view === 0 && p.edit === 0) errs.push('Grant at least one section permission');
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    
    setErrors([]);
    setSaving(true);
    
    try {
      const cleanedPermissions: SectionPermissions = {
        overview: permissions.overview,
        users: permissions.users,
        reports: permissions.reports,
        analytics: permissions.analytics,
        premium: permissions.premium,
        'expert-tips': permissions['expert-tips'],
        reviews: permissions.reviews,
        cafes: permissions.cafes,
      };

      const payload = isCreating 
        ? { 
            email: email.trim(), 
            username: username.trim(), 
            role_name: roleName.trim(), 
            permissions: cleanedPermissions 
          }
        : { 
            role_name: roleName.trim(), 
            permissions: cleanedPermissions 
          };
      
      await onSave(payload);
    } catch (error: any) {
      console.error('Save error:', error);
      setErrors([error.message || 'Failed to save admin role']);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: 'none' | 'view' | 'edit') => {
    setPermissions(
      preset === 'none' ? emptyPermissions() : 
      preset === 'view' ? allViewPermissions() : 
      allEditPermissions()
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              {isCreating ? <UserPlus className="w-5 h-5 text-white" /> : <Edit2 className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isCreating ? 'Create New Admin' : 'Edit Admin Role'}
              </h2>
              <p className="text-xs text-gray-500">
                {isCreating ? 'A new admin account will be created with a temporary password' : 'Update permissions below'}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 mb-1">Please fix the following:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {errors.map((e, i) => <li key={i} className="text-sm text-red-700">{e}</li>)}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={!isCreating}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Username {isCreating && '*'}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={!isCreating}
                placeholder="sarah_mod"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Role Name *
            </label>
            <input
              type="text"
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              placeholder="e.g. Content Moderator"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Section Permissions
              </label>
              <div className="flex gap-1.5">
                {(['none', 'view', 'edit'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition border border-gray-200"
                  >
                    {p === 'none' ? 'Clear All' : p === 'view' ? 'All View' : 'All Edit'}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {SECTIONS.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between px-4 py-3 ${
                      idx !== SECTIONS.length - 1 ? 'border-b border-gray-100' : ''
                    } hover:bg-gray-50 transition`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${section.bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${section.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{section.label}</span>
                    </div>
                    <PermissionToggle
                      level={permissions[section.id]}
                      onChange={level => setPermissions(prev => ({ ...prev, [section.id]: level }))}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {(() => {
            const c = countPermissions(permissions);
            return (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Permission Summary</span>
                <div className="flex gap-2">
                  {c.edit > 0 && <PermissionPill level="edit" compact />}
                  {c.view > 0 && <PermissionPill level="view" compact />}
                  <span className="text-xs text-gray-400">
                    {c.edit} edit · {c.view} view · {c.none} locked
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
            ) : isCreating ? (
              <><UserPlus className="w-4 h-4" /> Create Admin</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
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

// ─── Admin Card ────────────────────────────────────────────────────────────

const AdminCard: React.FC<{
  admin: AdminRole;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}> = ({ admin, onEdit, onDelete, onToggleActive }) => {
  const [expanded, setExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const perms = countPermissions(admin.permissions);

  const fmtDate = (d: string | null) => 
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const copyPassword = () => {
    if (admin.initial_password) {
      navigator.clipboard.writeText(admin.initial_password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ✅ Check if password is available and not yet changed
  const hasPassword = admin.initial_password && !admin.password_changed && !admin.last_login;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow hover:shadow-md ${
      !admin.is_active ? 'opacity-60' : ''
    }`}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="relative flex-shrink-0">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            admin.is_super_admin 
              ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
              : 'bg-gradient-to-br from-teal-400 to-cyan-500'
          }`}>
            {admin.username.charAt(0).toUpperCase()}
          </div>
          {!admin.is_active && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </div>
          )}
          {/* ✅ NEW: Password indicator badge */}
          {hasPassword && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white" title="Password available">
              <Key className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{admin.username}</span>
            {admin.is_super_admin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                <Shield className="w-3 h-3" /> Super Admin
              </span>
            )}
            {!admin.is_active && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                Deactivated
              </span>
            )}
            {/* ✅ NEW: Password not changed badge */}
            {hasPassword && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                <Key className="w-3 h-3" /> Password Available
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {admin.email} · <span className="italic">{admin.role_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 hidden sm:flex">
          {perms.edit > 0 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
              <Edit2 className="w-3 h-3" />{perms.edit}
            </span>
          )}
          {perms.view > 0 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-semibold">
              <Eye className="w-3 h-3" />{perms.view}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button 
            onClick={() => setExpanded(s => !s)} 
            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
          >
            {expanded ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
          </button>
          {!admin.is_super_admin && (
            <>
              <button 
                onClick={onEdit} 
                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" 
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={onToggleActive} 
                className={`p-1.5 rounded-lg transition ${
                  admin.is_active 
                    ? 'text-amber-500 hover:bg-amber-50' 
                    : 'text-green-500 hover:bg-green-50'
                }`} 
                title={admin.is_active ? 'Deactivate' : 'Reactivate'}
              >
                {admin.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button 
                onClick={onDelete} 
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" 
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          {/* ✅ NEW: Password Display Section */}
          {hasPassword && (
            <div className="mb-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Key className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900 mb-1">Temporary Password</h4>
                  <p className="text-xs text-amber-700">
                    This password will be hidden once the admin logs in and changes it.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    Password
                  </label>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1"
                  >
                    {showPassword ? (
                      <><EyeOff className="w-3 h-3" /> Hide</>
                    ) : (
                      <><Eye className="w-3 h-3" /> Show</>
                    )}
                  </button>
                </div>
                
                <div className="relative">
                  <div className="px-3 py-2 pr-10 bg-white border-2 border-amber-300 rounded-lg">
                    <p className="text-sm font-mono font-bold text-amber-900">
                      {showPassword ? admin.initial_password : '••••••••••••'}
                    </p>
                  </div>
                  <button
                    onClick={copyPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-100 rounded-md hover:bg-amber-200 transition"
                    title="Copy password"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                </div>
                
                {copied && (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Password copied!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Permissions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {SECTIONS.map(section => {
              const Icon = section.icon;
              const level = admin.permissions[section.id];
              return (
                <div 
                  key={section.id} 
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-2.5"
                >
                  <div className={`w-7 h-7 rounded-md ${section.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${section.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{section.label}</p>
                    <PermissionPill level={level} compact />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400">
            <span>Created: {fmtDate(admin.created_at)}</span>
            <span>Last login: {fmtDate(admin.last_login)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────

const AdminRoleManagement: React.FC = () => {
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  
  const [admins, setAdmins]           = useState<AdminRole[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRole | null>(null);
  const [isCreating, setIsCreating]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [error, setError]             = useState<string | null>(null);
  
  // Password display state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newAdminCredentials, setNewAdminCredentials] = useState<{
    email: string;
    username: string;
    password: string;
  } | null>(null);

  // ─── Fetch admins ───────────────────────────────────────────────────────

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        throw new Error(`Failed to fetch admins: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin roles');
      showError('Failed to load admin roles', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ─── Filtered list ──────────────────────────────────────────────────────

  const filtered = admins.filter(a =>
    a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Modal handlers ─────────────────────────────────────────────────────

  const openCreate = () => { 
    setIsCreating(true); 
    setEditingAdmin(null); 
    setModalOpen(true); 
  };
  
  const openEdit = (admin: AdminRole) => { 
    setIsCreating(false); 
    setEditingAdmin(admin); 
    setModalOpen(true); 
  };
  
  const closeModal = () => { 
    setModalOpen(false); 
    setEditingAdmin(null); 
    setIsCreating(false); 
  };

  // ─── Save ────────────────────────────────────────────────────────────────

  const handleSave = async (data: any) => {
    try {
      console.log('handleSave called with:', JSON.stringify(data, null, 2));
      
      if (isCreating) {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errData = await response.json();
          console.error('Backend error response:', errData);
          
          const errorMessages: string[] = [];
          if (errData.email) errorMessages.push(`Email: ${Array.isArray(errData.email) ? errData.email[0] : errData.email}`);
          if (errData.username) errorMessages.push(`Username: ${Array.isArray(errData.username) ? errData.username[0] : errData.username}`);
          if (errData.permissions) errorMessages.push(`Permissions: ${Array.isArray(errData.permissions) ? errData.permissions[0] : errData.permissions}`);
          if (errData.role_name) errorMessages.push(`Role: ${Array.isArray(errData.role_name) ? errData.role_name[0] : errData.role_name}`);
          if (errorMessages.length > 0) throw new Error(errorMessages.join('. '));
          throw new Error(errData.detail || JSON.stringify(errData));
        }
        
        const newAdmin = await response.json();
        console.log('New admin created:', newAdmin);
        
        // Check multiple possible password field names
        const password = newAdmin.initial_password || newAdmin.password || newAdmin.temp_password || null;
        
        console.log('Password field:', password);
        console.log('Full response:', JSON.stringify(newAdmin, null, 2));
        
        setAdmins(prev => [...prev, newAdmin]);
        closeModal();
        
        // Show password modal if password exists
        if (password) {
          setNewAdminCredentials({
            email: data.email,
            username: data.username,
            password: password
          });
          setShowPasswordModal(true);
        } else {
          showSuccess(
            'Admin account created!',
            `Account created for ${data.email}.`
          );
        }
      } else {
        const response = await fetch(`${API_BASE_URL}${editingAdmin!.id}/`, {
          method: 'PATCH',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to update admin');
        }
        
        const updated = await response.json();
        setAdmins(prev => prev.map(a => a.id === updated.id ? updated : a));
        showSuccess('Admin role updated successfully');
        closeModal();
      }
    } catch (err: any) {
      console.error('handleSave error:', err);
      throw new Error(err.message || 'Failed to save admin role');
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────────────

  const handleDelete = (admin: AdminRole) => {
    confirm({
      title: `Remove ${admin.username}?`,
      message: `This will:\n• Delete their admin account\n• Revoke all access\n• This action cannot be undone`,
      type: 'danger',
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}${admin.id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          
          if (response.status !== 204 && !response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.detail || 'Failed to delete admin');
          }
          
          setAdmins(prev => prev.filter(a => a.id !== admin.id));
          showSuccess(`${admin.username} removed successfully`);
        } catch (err: any) {
          showError('Failed to delete admin', err.message);
        }
      },
    });
  };

  // ─── Toggle active ──────────────────────────────────────────────────────

  const handleToggleActive = (admin: AdminRole) => {
    const action = admin.is_active ? 'deactivate' : 'activate';
    const message = admin.is_active 
      ? `${admin.username} will immediately lose access to the admin panel.`
      : `${admin.username} will regain access to the admin panel.`;
    
    confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${admin.username}?`,
      message,
      type: admin.is_active ? 'warning' : 'info',
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}${admin.id}/toggle_active/`, {
            method: 'POST',
            headers: getAuthHeaders(),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.detail || 'Failed to toggle admin status');
          }
          
          const data = await response.json();
          const updatedAdmin = data.admin_role;
          
          setAdmins(prev => prev.map(a => a.id === updatedAdmin.id ? updatedAdmin : a));
          showSuccess(`Admin ${action}d successfully`);
        } catch (err: any) {
          showError(`Failed to ${action} admin`, err.message);
        }
      },
    });
  };

  // ─── Stats ──────────────────────────────────────────────────────────────

  const totalAdmins    = admins.length;
  const activeAdmins   = admins.filter(a => a.is_active).length;
  const inactiveAdmins = admins.filter(a => !a.is_active).length;

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex gap-3">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-800 mb-1">Error loading admin roles</p>
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={fetchAdmins}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-4">
          {[
            { label: 'Total Admins', value: totalAdmins, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Active',       value: activeAdmins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Inactive',     value: inactiveAdmins, color: 'text-gray-600', bg: 'bg-gray-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-4 py-2.5 flex items-center gap-2.5`}>
              <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-500 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition shadow-sm"
        >
          <UserPlus className="w-4.5 h-4.5" /> Create Admin
        </button>
      </div>

      <div className="relative">
        <svg 
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search by username, email, or role…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none bg-white"
        />
      </div>

      <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
        <span className="font-semibold text-gray-600">Legend:</span>
        {(['none', 'view', 'edit'] as PermissionLevel[]).map(l => (
          <PermissionPill key={l} level={l} compact />
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-14 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No admins match your search' : 'No admin roles found'}
            </p>
          </div>
        ) : (
          filtered.map(admin => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onEdit={() => openEdit(admin)}
              onDelete={() => handleDelete(admin)}
              onToggleActive={() => handleToggleActive(admin)}
            />
          ))
        )}
      </div>

      {modalOpen && (
        <AdminModal
          admin={editingAdmin}
          isCreating={isCreating}
          onSave={handleSave}
          onCancel={closeModal}
        />
      )}

      {showPasswordModal && newAdminCredentials && (
        <PasswordModal
          email={newAdminCredentials.email}
          username={newAdminCredentials.username}
          password={newAdminCredentials.password}
          onClose={() => {
            setShowPasswordModal(false);
            setNewAdminCredentials(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminRoleManagement;