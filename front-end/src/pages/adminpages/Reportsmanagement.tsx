import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Search, CheckCircle, XCircle, Loader, X, Eye, User, MessageSquare
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';

interface Report {
  id: number;
  reporter: number;
  reporter_username: string;
  reported_user: number;
  reported_username: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  reviewed_by_username: string | null;
  admin_notes: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

const ReportsManagement: React.FC = () => {
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsPagination, setReportsPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });
  const [reportsPage, setReportsPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [reportReasonFilter, setReportReasonFilter] = useState<string>('all');
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  
  // Modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadReports = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (reportStatusFilter !== 'all') params.append('status', reportStatusFilter);
      if (reportReasonFilter !== 'all') params.append('reason', reportReasonFilter);
      
      const data = await adminService.adminApiCall<{ results: Report[]; count: number; next: string | null; previous: string | null }>(`/reports/?${params.toString()}`);
      setReports(data.results || []);
      setReportsPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
      });
      setReportsPage(page);
    } catch (err) {
      const errorMessage = 'Failed to load reports';
      setError(errorMessage);
      showError('Load Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reviewReport = async (report: Report, action: string, adminNotes: string = '') => {
    setLoading(true);
    try {
      const data = await adminService.adminApiCall<{ message: string; report: Report }>(
        `/reports/${report.id}/review/`, 
        'POST', 
        { action, admin_notes: adminNotes }
      );
      
      const actionText = action === 'resolve' ? 'resolved' : 'dismissed';
      showSuccess(
        `Report ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        `Report against ${report.reported_username} has been ${actionText}`
      );
      
      loadReports(reportsPage);
      setShowDetailModal(false);
      setSelectedReport(null);
    } catch (err) {
      const error = err as Error;
      showError(
        'Review Failed',
        `Failed to review report: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (report: Report, action: 'resolve' | 'dismiss') => {
    const actionText = action === 'resolve' ? 'Resolve' : 'Dismiss';
    const actionPastTense = action === 'resolve' ? 'resolved' : 'dismissed';
    
    confirm({
      title: `${actionText} Report`,
      message: `Are you sure you want to ${action} this report against ${report.reported_username}?\n\nReason: ${report.reason}\nReporter: ${report.reporter_username}`,
      type: action === 'resolve' ? 'info' : 'warning',
      confirmText: actionText,
      cancelText: 'Cancel',
      onConfirm: async () => {
        await reviewReport(report, action, `Report ${actionPastTense} by admin`);
      }
    });
  };

  const bulkReviewReports = async (action: string) => {
    if (selectedReports.length === 0) {
      showWarning('No Selection', 'Please select at least one report to review');
      return;
    }
    
    const actionText = action === 'resolve' ? 'resolve' : 'dismiss';
    const actionPastTense = action === 'resolve' ? 'resolved' : 'dismissed';
    
    confirm({
      title: `Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Reports`,
      message: `Are you sure you want to ${actionText} ${selectedReports.length} report(s)?`,
      type: action === 'resolve' ? 'info' : 'warning',
      confirmText: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} All`,
      cancelText: 'Cancel',
      onConfirm: async () => {
        setLoading(true);
        try {
          const data = await adminService.adminApiCall<{ message: string; updated_count: number }>(
            '/reports/bulk_review/', 
            'POST', 
            {
              report_ids: selectedReports,
              action,
              admin_notes: `Bulk ${actionPastTense}`,
            }
          );
          
          showSuccess(
            'Bulk Review Complete',
            `${data.updated_count} report(s) have been ${actionPastTense}`
          );
          
          setSelectedReports([]);
          loadReports(reportsPage);
        } catch (err) {
          const error = err as Error;
          showError('Bulk Review Failed', error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  useEffect(() => {
    loadReports(1);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadReports(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, reportStatusFilter, reportReasonFilter]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      harassment: 'Harassment',
      inappropriate: 'Inappropriate Content',
      fake: 'Fake Profile',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Report Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="relative col-span-full lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={reportStatusFilter}
            onChange={(e) => setReportStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={reportReasonFilter}
            onChange={(e) => setReportReasonFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="all">All Reasons</option>
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="inappropriate">Inappropriate Content</option>
            <option value="fake">Fake Profile</option>
            <option value="other">Other</option>
          </select>
        </div>

        {selectedReports.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => bulkReviewReports('resolve')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4" />
              Resolve ({selectedReports.length})
            </button>
            <button
              onClick={() => bulkReviewReports('dismiss')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              disabled={loading}
            >
              <XCircle className="w-4 h-4" />
              Dismiss ({selectedReports.length})
            </button>
            <button
              onClick={() => setSelectedReports([])}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === reports.length && reports.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReports(reports.map(r => r.id));
                      } else {
                        setSelectedReports([]);
                      }
                    }}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reported User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading reports...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No reports found</p>
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports([...selectedReports, report.id]);
                          } else {
                            setSelectedReports(selectedReports.filter(id => id !== report.id));
                          }
                        }}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{report.reporter_username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{report.reported_username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 capitalize">
                        {report.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                        report.status === 'resolved' ? 'bg-green-50 text-green-700' :
                        report.status === 'dismissed' ? 'bg-gray-50 text-gray-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(report.created_at)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReviewClick(report, 'resolve')}
                              className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition"
                              disabled={loading}
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleReviewClick(report, 'dismiss')}
                              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
                              disabled={loading}
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {reportsPagination.count > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((reportsPage - 1) * 20) + 1} to {Math.min(reportsPage * 20, reportsPagination.count)} of {reportsPagination.count} reports
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadReports(reportsPage - 1)}
                disabled={!reportsPagination.previous || loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => loadReports(reportsPage + 1)}
                disabled={!reportsPagination.next || loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedReport(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Summary */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {getReasonLabel(selectedReport.reason)}
                    </h3>
                    <p className="text-sm text-gray-700">
                      Reported by <span className="font-semibold">{selectedReport.reporter_username}</span> against{' '}
                      <span className="font-semibold">{selectedReport.reported_username}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    selectedReport.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedReport.description && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Description
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedReport.description}</p>
                  </div>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reporter</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-900 font-medium">{selectedReport.reporter_username}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reported User</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm text-gray-900 font-bold">{selectedReport.reported_username}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Submitted</p>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedReport.created_at)}</p>
                </div>

                {selectedReport.reviewed_at && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reviewed</p>
                    <p className="text-sm text-gray-900">{formatDateTime(selectedReport.reviewed_at)}</p>
                  </div>
                )}

                {selectedReport.reviewed_by_username && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reviewed By</p>
                    <p className="text-sm text-gray-900">{selectedReport.reviewed_by_username}</p>
                  </div>
                )}

                {selectedReport.admin_notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Admin Notes</p>
                    <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{selectedReport.admin_notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedReport.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleReviewClick(selectedReport, 'resolve')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-semibold"
                    disabled={loading}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve Report
                  </button>
                  <button
                    onClick={() => handleReviewClick(selectedReport, 'dismiss')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition font-semibold"
                    disabled={loading}
                  >
                    <XCircle className="w-4 h-4" />
                    Dismiss Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;