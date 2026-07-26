import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, X, LogOut, BarChart3, Users as UsersIcon, AlertTriangle,
  FileText, Crown, Lightbulb, Quote, Settings, Layers, Ticket, Coffee
} from 'lucide-react';
import { adminService } from '../services/profileService';
import { NotificationProvider, useNotification } from './adminpages/Notificationsystem';

// Import page components
import Overview from './adminpages/Overview';
import UserManagement from './adminpages/Usermanagement';
import ReportsManagement from './adminpages/Reportsmanagement';
import AdminActionsLog from './adminpages/Adminactionslog';
import PremiumManagement from './adminpages/Premiummanagement';
import PromoCodeManagement from './adminpages/Promocodemanagement';
import ExpertTipsManagement from './adminpages/ExpertTipsManagement';
import ReviewsManagement from './adminpages/ReviewsManagement';
import AdminRoleManagement from './adminpages/Adminrolemanagement';
import FooterManagement from './adminpages/Footermanagement';
import CafeManagement from './adminpages/Cafemanagement';

// Define all available tabs
type TabId = 'overview' | 'users' | 'reports' | 'analytics' | 'premium' | 'promo-codes' | 'expert-tips' | 'reviews' | 'admin-roles' | 'footer' | 'cafes';

// Inner component that uses notifications
const AdminPanelContent: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useNotification();
  
  // Check admin access on mount
  useEffect(() => {
    if (!adminService.isAdmin()) {
      navigate('/admin/login');
    }
  }, [navigate]);
  
  // Get admin user info
  const adminUser = adminService.getAdminUser();
  
  // Main state
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Logout handler with custom confirmation
  const handleLogout = () => {
    confirm({
      title: 'Logout Confirmation',
      message: 'Are you sure you want to logout from the admin panel?',
      type: 'warning',
      confirmText: 'Yes, Logout',
      cancelText: 'Cancel',
      onConfirm: () => {
        adminService.adminLogout();
        navigate('/');
      }
    });
  };

  // Get tab title and description
  const getTabInfo = () => {
    const tabInfo: Record<TabId, { title: string; description: string }> = {
      overview: { title: 'Dashboard Overview', description: 'View system statistics and analytics' },
      users: { title: 'User Management', description: 'Manage and moderate user accounts' },
      reports: { title: 'Reports Management', description: 'Review and handle user reports' },
      analytics: { title: 'Admin Actions Log', description: 'Track administrative actions' },
      premium: { title: 'Premium Management', description: 'Manage premium plans and features' },
      'promo-codes': { title: 'Promo Codes', description: 'Manage promotional discount codes' },
      'expert-tips': { title: 'Expert Tips Management', description: 'Manage expert tips and advice' },
      reviews: { title: 'Reviews Management', description: 'Review and approve user testimonials' },
      'admin-roles': { title: 'Admin Role Management', description: 'Manage admin permissions and access' },
      footer: { title: 'Footer Management', description: 'Manage footer sections and links' },
      cafes: { title: 'Cafe Management', description: 'Review partner applications, manage listings, and view bookings' }
    };
    return tabInfo[activeTab];
  };

  const currentTabInfo = getTabInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-20 shadow-lg`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">Admin Panel</h1>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition shrink-0"
              title="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-3 border border-teal-100">
            <p className="text-xs text-teal-600 font-medium mb-1">Logged in as</p>
            <p className="text-sm font-bold text-gray-900 truncate">{adminUser?.username || 'Admin'}</p>
            {adminUser?.email && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{adminUser.email}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'overview' as const, label: 'Overview', icon: BarChart3, color: 'text-blue-500' },
              { id: 'users' as const, label: 'User Management', icon: UsersIcon, color: 'text-teal-500' },
              { id: 'reports' as const, label: 'Reports', icon: AlertTriangle, color: 'text-orange-500' },
              { id: 'analytics' as const, label: 'Admin Actions', icon: FileText, color: 'text-indigo-500' },
              { id: 'premium' as const, label: 'Premium', icon: Crown, color: 'text-purple-500' },
              { id: 'promo-codes' as const, label: 'Promo Codes', icon: Ticket, color: 'text-pink-500' },
              { id: 'expert-tips' as const, label: 'Expert Tips', icon: Lightbulb, color: 'text-amber-500' },
              { id: 'reviews' as const, label: 'Reviews', icon: Quote, color: 'text-rose-500' },
              { id: 'admin-roles' as const, label: 'Admin Roles', icon: Settings, color: 'text-gray-500' },
              { id: 'footer' as const, label: 'Footer', icon: Layers, color: 'text-slate-500' },
              { id: 'cafes' as const, label: 'Cafes', icon: Coffee, color: 'text-orange-500' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-600 font-semibold shadow-sm border border-teal-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? tab.color : ''}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 shadow-sm"
                    title="Open sidebar"
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </button>
                )}
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentTabInfo.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{currentTabInfo.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="w-full px-6 py-6">
            {/* Render the active tab content */}
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'reports' && <ReportsManagement />}
            {activeTab === 'analytics' && <AdminActionsLog />}
            {activeTab === 'premium' && <PremiumManagement />}
            {activeTab === 'promo-codes' && <PromoCodeManagement />}
            {activeTab === 'expert-tips' && <ExpertTipsManagement />}
            {activeTab === 'reviews' && <ReviewsManagement />}
            {activeTab === 'admin-roles' && <AdminRoleManagement />}
            {activeTab === 'footer' && <FooterManagement />}
            {activeTab === 'cafes' && <CafeManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main wrapper component with NotificationProvider
const AdminPanel: React.FC = () => {
  return (
    <NotificationProvider>
      <AdminPanelContent />
    </NotificationProvider>
  );
};

export default AdminPanel;