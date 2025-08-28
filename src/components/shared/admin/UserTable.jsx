import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Counter from '../../ui/counter/Counter';

const UserTable = ({ 
  users, 
  loading, 
  error, 
  onUserDetails, 
  onDeleteUser, 
  onRefresh 
}) => {
  const { theme } = useTheme();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-users fa-3x text-muted mb-3"></i>
        <h5 className="text-muted">No users found</h5>
        <p className="text-muted">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className={`table table-hover mb-0 ${
        theme === 'dark' ? 'table-dark' : ''
      }`}>
        <thead className="table-primary">
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Country</th>
            <th>Activity</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                <div className="d-flex align-items-center">
                  <div className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="fw-semibold">{user.username}</div>
                    {user.phone && (
                      <small className="text-muted">{user.phone}</small>
                    )}
                  </div>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <span className="badge bg-secondary">
                  {user.profile?.country || 'Not set'}
                </span>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <span className="badge bg-primary" title="Bookmarks">
                    <i className="fas fa-bookmark me-1"></i>
                    <Counter value={user.bookmarkCount || 0} />
                  </span>
                  <span className="badge bg-danger" title="Likes">
                    <i className="fas fa-heart me-1"></i>
                    <Counter value={user.likeCount || 0} />
                  </span>
                  <span className="badge bg-success" title="Views">
                    <i className="fas fa-eye me-1"></i>
                    <Counter value={user.viewCount || 0} />
                  </span>
                </div>
              </td>
              <td>
                <small>{formatDate(user.createdAt)}</small>
              </td>
              <td>
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-info"
                    onClick={() => onUserDetails && onUserDetails(user._id)}
                    title="View Details"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => onDeleteUser && onDeleteUser(user._id)}
                    title="Delete User"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
