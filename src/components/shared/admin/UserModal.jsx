import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Counter from '../../ui/counter/Counter';

const UserModal = ({ user, show, onClose, onDelete }) => {
  const { theme } = useTheme();

  if (!show || !user) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(user.user._id);
    }
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className={`modal-content ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}>
          <div className="modal-header">
            <h5 className={`modal-title ${theme === 'dark' ? 'text-light' : ''}`}>
              <i className="fas fa-user me-2"></i>
              User Details - {user.user.username}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>Personal Information</h6>
                <table className={`table table-sm ${theme === 'dark' ? 'table-dark' : ''}`}>
                  <tbody>
                    <tr>
                      <td><strong>Username:</strong></td>
                      <td>{user.user.username}</td>
                    </tr>
                    <tr>
                      <td><strong>Email:</strong></td>
                      <td>{user.user.email}</td>
                    </tr>
                    <tr>
                      <td><strong>Phone:</strong></td>
                      <td>{user.user.phone || 'Not provided'}</td>
                    </tr>
                    <tr>
                      <td><strong>Country:</strong></td>
                      <td>{user.user.profile?.country || 'Not specified'}</td>
                    </tr>
                    <tr>
                      <td><strong>Language:</strong></td>
                      <td>{user.user.profile?.language || 'English'}</td>
                    </tr>
                    <tr>
                      <td><strong>Joined:</strong></td>
                      <td>{formatDate(user.user.createdAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h6 className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>Activity Statistics</h6>
                <table className={`table table-sm ${theme === 'dark' ? 'table-dark' : ''}`}>
                  <tbody>
                    <tr>
                      <td><strong>Total Bookmarks:</strong></td>
                      <td>
                        <span className="badge bg-primary">
                          <Counter value={user.activityStats?.totalBookmarks || 0} />
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Total Likes:</strong></td>
                      <td>
                        <span className="badge bg-danger">
                          <Counter value={user.activityStats?.totalLikes || 0} />
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Total Views:</strong></td>
                      <td>
                        <span className="badge bg-success">
                          <Counter value={user.activityStats?.totalViews || 0} />
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {user.user.profile?.bio && (
              <div className="mt-3">
                <h6 className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>Bio</h6>
                <p className={`p-3 bg-light rounded ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
                  {user.user.profile.bio}
                </p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={handleDelete}
            >
              <i className="fas fa-trash me-1"></i>
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
