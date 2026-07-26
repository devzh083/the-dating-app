import React, { useState, useEffect } from 'react';
import { 
  Star, Quote, Shield, User, CheckCircle, XCircle, Eye, Trash2, 
  Search, Filter, Loader, AlertTriangle, X, Calendar, Clock, MessageSquare
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';

interface Review {
  id: number;
  user: number;
  username: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
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

const ReviewsManagement: React.FC = () => {
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({ 
    count: 0, 
    next: null, 
    previous: null 
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // Selection
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  
  // Modal
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);

  // API helper
  const apiCall = async <T,>(endpoint: string, method: string = 'GET', data: any = null): Promise<T> => {
    try {
      return await adminService.adminApiCall<T>(endpoint, method, data);
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  };

  // Load reviews
  const loadReviews = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      
      const data = await apiCall<{ 
        results: Review[]; 
        count: number; 
        next: string | null; 
        previous: string | null 
      }>(`/reviews/?${params.toString()}`);
      
      setReviews(data.results || []);
      setPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
      });
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = 'Failed to load reviews';
      setError(errorMessage);
      showError('Load Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Approve review with notes modal
  const handleApproveClick = (review: Review) => {
    setSelectedReview(review);
    setAdminNotes('');
    setShowNotesInput(true);
    setPendingAction('approve');
  };

  // Reject review with notes modal
  const handleRejectClick = (review: Review) => {
    setSelectedReview(review);
    setAdminNotes('');
    setShowNotesInput(true);
    setPendingAction('reject');
  };

  // Execute approve/reject after notes
  const executeAction = async () => {
    if (!selectedReview || !pendingAction) return;

    setLoading(true);
    setShowNotesInput(false);

    try {
      const endpoint = pendingAction === 'approve' 
        ? `/reviews/${selectedReview.id}/approve/`
        : `/reviews/${selectedReview.id}/reject/`;
      
      const data = await apiCall<{ message: string; review: Review }>(
        endpoint, 
        'POST', 
        { admin_notes: adminNotes }
      );
      
      showSuccess(
        pendingAction === 'approve' ? 'Review Approved' : 'Review Rejected',
        data.message
      );
      
      loadReviews(currentPage);
      setShowDetailModal(false);
      setSelectedReview(null);
    } catch (err) {
      const error = err as Error;
      showError(
        pendingAction === 'approve' ? 'Approval Failed' : 'Rejection Failed',
        error.message
      );
    } finally {
      setLoading(false);
      setPendingAction(null);
      setAdminNotes('');
    }
  };

  // Delete review with confirmation
  const deleteReview = (reviewId: number) => {
    confirm({
      title: 'Delete Review',
      message: 'Are you sure you want to permanently delete this review? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setLoading(true);
        try {
          await apiCall(`/reviews/${reviewId}/`, 'DELETE');
          showSuccess('Review Deleted', 'The review has been permanently removed.');
          loadReviews(currentPage);
          setShowDetailModal(false);
          setSelectedReview(null);
        } catch (err) {
          const error = err as Error;
          showError('Delete Failed', error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Bulk approve with confirmation
  const bulkApprove = () => {
    if (selectedReviews.length === 0) {
      showWarning('No Selection', 'Please select at least one review to approve.');
      return;
    }
    
    confirm({
      title: 'Bulk Approve Reviews',
      message: `Are you sure you want to approve ${selectedReviews.length} review(s)?`,
      confirmText: 'Approve All',
      cancelText: 'Cancel',
      type: 'info',
      onConfirm: async () => {
        setLoading(true);
        try {
          const data = await apiCall<{ message: string; approved_count: number }>(
            '/reviews/bulk_approve/', 
            'POST', 
            { review_ids: selectedReviews }
          );
          showSuccess('Bulk Approval Complete', data.message);
          setSelectedReviews([]);
          loadReviews(currentPage);
        } catch (err) {
          const error = err as Error;
          showError('Bulk Approval Failed', error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Bulk reject with confirmation
  const bulkReject = () => {
    if (selectedReviews.length === 0) {
      showWarning('No Selection', 'Please select at least one review to reject.');
      return;
    }
    
    confirm({
      title: 'Bulk Reject Reviews',
      message: `Are you sure you want to reject ${selectedReviews.length} review(s)?`,
      confirmText: 'Reject All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setLoading(true);
        try {
          const data = await apiCall<{ message: string; rejected_count: number }>(
            '/reviews/bulk_reject/', 
            'POST', 
            { review_ids: selectedReviews }
          );
          showSuccess('Bulk Rejection Complete', data.message);
          setSelectedReviews([]);
          loadReviews(currentPage);
        } catch (err) {
          const error = err as Error;
          showError('Bulk Rejection Failed', error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Initial load
  useEffect(() => {
    loadReviews(1);
  }, []);

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadReviews(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, ratingFilter]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-700',
      approved: 'bg-green-50 text-green-700',
      rejected: 'bg-red-50 text-red-700',
    };
    return colors[status] || 'bg-gray-50 text-gray-700';
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

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="relative col-span-full lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {selectedReviews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={bulkApprove}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4" />
              Approve ({selectedReviews.length})
            </button>
            <button
              onClick={bulkReject}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              disabled={loading}
            >
              <XCircle className="w-4 h-4" />
              Reject ({selectedReviews.length})
            </button>
            <button
              onClick={() => setSelectedReviews([])}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReviews.length === reviews.length && reviews.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReviews(reviews.map(r => r.id));
                      } else {
                        setSelectedReviews([]);
                      }
                    }}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Review</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading reviews...</p>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Quote className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No reviews found</p>
                  </td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReviews([...selectedReviews, review.id]);
                          } else {
                            setSelectedReviews(selectedReviews.filter(id => id !== review.id));
                          }
                        }}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{review.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-sm text-gray-700 line-clamp-2">"{review.text}"</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(review.created_at)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDetailModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.count > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.count)} of {pagination.count} reviews
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadReviews(currentPage - 1)}
                disabled={!pagination.previous || loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => loadReviews(currentPage + 1)}
                disabled={!pagination.next || loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Review Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedReview(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{selectedReview.username}</h3>
                    <Shield className="w-4 h-4 text-teal-500 fill-teal-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    {renderStars(selectedReview.rating)}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedReview.status)}`}>
                      {selectedReview.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div className="bg-gray-50 rounded-xl p-6">
                <Quote className="w-6 h-6 text-gray-400 mb-3" />
                <p className="text-gray-700 leading-relaxed italic">{selectedReview.text}</p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Submitted
                  </p>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedReview.created_at)}</p>
                </div>
                {selectedReview.reviewed_at && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Reviewed
                    </p>
                    <p className="text-sm text-gray-900">{formatDateTime(selectedReview.reviewed_at)}</p>
                  </div>
                )}
                {selectedReview.reviewed_by_username && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reviewed By</p>
                    <p className="text-sm text-gray-900">{selectedReview.reviewed_by_username}</p>
                  </div>
                )}
                {selectedReview.admin_notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Admin Notes</p>
                    <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{selectedReview.admin_notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedReview.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproveClick(selectedReview)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-semibold"
                      disabled={loading}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Review
                    </button>
                    <button
                      onClick={() => handleRejectClick(selectedReview)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold"
                      disabled={loading}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Review
                    </button>
                  </>
                )}
                
                {selectedReview.status === 'approved' && (
                  <button
                    onClick={() => handleRejectClick(selectedReview)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold"
                    disabled={loading}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Review
                  </button>
                )}

                {selectedReview.status === 'rejected' && (
                  <button
                    onClick={() => handleApproveClick(selectedReview)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-semibold"
                    disabled={loading}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Review
                  </button>
                )}

                <button
                  onClick={() => deleteReview(selectedReview.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-red-600 rounded-xl hover:bg-red-50 transition font-semibold"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes Input Modal */}
      {showNotesInput && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">
                {pendingAction === 'approve' ? 'Approve Review' : 'Reject Review'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {pendingAction === 'approve' 
                  ? 'Add optional notes about this approval'
                  : 'Please provide a reason for rejection'}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Notes {pendingAction === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={pendingAction === 'approve' 
                  ? 'Enter any notes (optional)...'
                  : 'Enter reason for rejection...'
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowNotesInput(false);
                  setPendingAction(null);
                  setAdminNotes('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={pendingAction === 'reject' && !adminNotes.trim()}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  pendingAction === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {pendingAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;