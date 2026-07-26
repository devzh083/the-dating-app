import React, { useState, useEffect } from 'react';
import {
  Users, Activity, Heart, AlertTriangle, RefreshCw, Loader, X
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalMatches: number;
  totalMessages: number;
  reportsCount: number;
  pendingReports: number;
  resolvedReports: number;
  verifiedUsers: number;
  premiumUsers: number;
  completeProfiles: number;
  accountStatusDistribution: {
    active: number;
    pending: number;
    suspended: number;
    banned: number;
  };
  recentActions: Array<{ action_type: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
}

const Overview: React.FC = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadDashboardStats = async (showNotification: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.adminApiCall<DashboardStats>('/dashboard/stats/');
      setStats(data);
      setLastRefresh(new Date());
      
      if (showNotification) {
        showSuccess('Dashboard Refreshed', 'Statistics have been updated successfully');
      }
    } catch (err) {
      const errorMsg = 'Failed to load dashboard statistics';
      setError(errorMsg);
      showError('Load Failed', errorMsg);
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats(false);
  }, []);

  const handleRefresh = () => {
    loadDashboardStats(true);
  };

  const formatLastRefresh = (): string => {
    if (!lastRefresh) return 'Never';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return lastRefresh.toLocaleString();
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Dashboard</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={() => loadDashboardStats(false)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Error Message Banner (if refresh fails but we have cached data) */}
      {error && stats && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            View system statistics and analytics
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-500" />}
          bgColor="bg-blue-50"
          value={stats.totalUsers}
          label="Total Users"
          subLabel={`+${stats.newUsersToday} today`}
        />

        <StatCard
          icon={<Activity className="w-6 h-6 text-green-500" />}
          bgColor="bg-green-50"
          value={stats.activeUsers}
          label="Active Now"
          subLabel={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% online`}
        />

        <StatCard
          icon={<Heart className="w-6 h-6 text-pink-500" />}
          bgColor="bg-pink-50"
          value={stats.totalMatches}
          label="Total Matches"
          subLabel={`Avg ${stats.totalUsers > 0 ? (stats.totalMatches / stats.totalUsers).toFixed(1) : 0} per user`}
        />

        <StatCard
          icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
          bgColor="bg-red-50"
          value={stats.pendingReports}
          label="Pending Reports"
          subLabel={`${stats.reportsCount} total`}
          highlight={stats.pendingReports > 0}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.accountStatusDistribution || {}).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    key === 'active' ? 'bg-green-500' :
                    key === 'pending' ? 'bg-blue-500' :
                    key === 'suspended' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600 capitalize">{key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                  {stats.totalUsers > 0 && (
                    <span className="text-xs text-gray-400">
                      ({Math.round((count / stats.totalUsers) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth (7 Days)</h3>
          {(stats.userGrowth || []).length > 0 ? (
            <div className="space-y-2">
              {stats.userGrowth.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 w-20">{item.date}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="h-2 bg-teal-500 rounded-full transition-all"
                      style={{ width: `${Math.max(item.count * 10, 4)}px` }}
                    />
                    <span className="text-xs font-semibold text-gray-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No growth data available</p>
            </div>
          )}
        </div>
      </div>

      {/* More Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Messages</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">
            Avg {stats.totalUsers > 0 ? Math.round(stats.totalMessages / stats.totalUsers) : 0} per user
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Verified Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.verifiedUsers}</p>
          <p className="text-xs text-gray-400 mt-2">
            {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}% of total
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Premium Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.premiumUsers}</p>
          <p className="text-xs text-gray-400 mt-2">
            {stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% of total
          </p>
        </div>
      </div>

      {/* New Users Stats */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">New User Registrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Today</p>
            <p className="text-2xl font-bold text-teal-600">+{stats.newUsersToday}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">This Week</p>
            <p className="text-2xl font-bold text-teal-600">+{stats.newUsersWeek}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">This Month</p>
            <p className="text-2xl font-bold text-teal-600">+{stats.newUsersMonth}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  bgColor: string;
  value: number;
  label: string;
  subLabel?: string;
  highlight?: boolean;
}> = ({ icon, bgColor, value, label, subLabel, highlight }) => {
  return (
    <div className={`bg-white rounded-xl border ${highlight ? 'border-red-300 shadow-md' : 'border-gray-200'} p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-2xl font-bold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
          {value.toLocaleString()}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {subLabel && (
        <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
      )}
    </div>
  );
};

export default Overview;