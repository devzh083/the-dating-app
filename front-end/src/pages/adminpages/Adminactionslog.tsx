import React, { useState, useEffect } from 'react';
import { FileText, Loader, AlertTriangle, X, RefreshCw, Filter, Download } from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';

interface AdminAction {
  id: number;
  admin: number;
  admin_username: string;
  target_user: number;
  target_username: string;
  action_type: 'suspend' | 'ban' | 'activate' | 'delete' | 'verify' | 'warn';
  reason: string;
  created_at: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminActionsLog: React.FC = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [actionsPage, setActionsPage] = useState<number>(1);
  const [actionsPagination, setActionsPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });
  
  // Filters
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [adminFilter, setAdminFilter] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadAdminActions = async (page: number = 1, showNotification: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      
      if (actionTypeFilter !== 'all') {
        params.append('action_type', actionTypeFilter);
      }
      
      if (adminFilter.trim()) {
        params.append('admin_username', adminFilter.trim());
      }
      
      const data = await adminService.adminApiCall<{ results: AdminAction[]; count: number; next: string | null; previous: string | null }>(`/actions/?${params.toString()}`);
      setAdminActions(data.results || []);
      setActionsPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
      });
      setActionsPage(page);
      setLastRefresh(new Date());
      
      if (showNotification) {
        showSuccess('Log Refreshed', 'Admin actions log has been updated');
      }
    } catch (err) {
      const errorMsg = 'Failed to load admin actions';
      setError(errorMsg);
      showError('Load Failed', errorMsg);
      console.error('Error loading admin actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminActions(1, false);
  }, []);

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAdminActions(1, false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [actionTypeFilter, adminFilter]);

  const handleRefresh = () => {
    loadAdminActions(actionsPage, true);
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatLastRefresh = (): string => {
    if (!lastRefresh) return 'Never';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return lastRefresh.toLocaleString();
  };

  const getActionStats = () => {
    const stats = {
      total: actionsPagination.count,
      ban: 0,
      suspend: 0,
      activate: 0,
      verify: 0,
      delete: 0,
      warn: 0,
    };
    
    adminActions.forEach(action => {
      if (action.action_type in stats) {
        stats[action.action_type]++;
      }
    });
    
    return stats;
  };

  const stats = getActionStats();

  if (loading && adminActions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading admin actions log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Actions Log</h2>
          <p className="text-sm text-gray-500 mt-1">
            View all administrative actions
            {lastRefresh && (
              <span className="ml-2 text-gray-400">• Last updated: {formatLastRefresh()}</span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-xs text-red-600 font-medium mb-1">Bans</p>
          <p className="text-2xl font-bold text-red-700">{stats.ban}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-xs text-yellow-600 font-medium mb-1">Suspensions</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.suspend}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-xs text-green-600 font-medium mb-1">Activations</p>
          <p className="text-2xl font-bold text-green-700">{stats.activate}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Verifications</p>
          <p className="text-2xl font-bold text-blue-700">{stats.verify}</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <p className="text-xs text-purple-600 font-medium mb-1">Warnings</p>
          <p className="text-2xl font-bold text-purple-700">{stats.warn}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-xs text-red-600 font-medium mb-1">Deletions</p>
          <p className="text-2xl font-bold text-red-700">{stats.delete}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={actionTypeFilter}
              onChange={(e) => setActionTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            >
              <option value="all">All Actions</option>
              <option value="ban">Ban</option>
              <option value="suspend">Suspend</option>
              <option value="activate">Activate</option>
              <option value="verify">Verify</option>
              <option value="warn">Warn</option>
              <option value="delete">Delete</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Username
            </label>
            <input
              type="text"
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              placeholder="Filter by admin..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        {(actionTypeFilter !== 'all' || adminFilter) && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                setActionTypeFilter('all');
                setAdminFilter('');
              }}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Admin Actions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Target User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && adminActions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading actions...</p>
                  </td>
                </tr>
              ) : adminActions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium mb-1">No admin actions found</p>
                    <p className="text-xs text-gray-500">
                      {actionTypeFilter !== 'all' || adminFilter 
                        ? 'Try adjusting your filters'
                        : 'Actions will appear here once admins perform moderation tasks'}
                    </p>
                  </td>
                </tr>
              ) : (
                adminActions.map(action => (
                  <tr key={action.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{action.admin_username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{action.target_username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        action.action_type === 'ban' ? 'bg-red-50 text-red-700' :
                        action.action_type === 'suspend' ? 'bg-yellow-50 text-yellow-700' :
                        action.action_type === 'activate' ? 'bg-green-50 text-green-700' :
                        action.action_type === 'verify' ? 'bg-blue-50 text-blue-700' :
                        action.action_type === 'delete' ? 'bg-red-50 text-red-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        {action.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {action.reason || <span className="italic text-gray-400">No reason provided</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDateTime(action.created_at)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {actionsPagination.count > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((actionsPage - 1) * 20) + 1} to {Math.min(actionsPage * 20, actionsPagination.count)} of {actionsPagination.count} action{actionsPagination.count !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadAdminActions(actionsPage - 1, false)}
                disabled={!actionsPagination.previous || loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => loadAdminActions(actionsPage + 1, false)}
                disabled={!actionsPagination.next || loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActionsLog;