import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import { updateUser } from '../store/slices/authSlice';
import ArticleModalSimple from '../components/shared/ArticleModalSimple';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileImage, setShowProfileImage] = useState(true);
  const [userStats, setUserStats] = useState({
    articlesRead: 0,
    totalReadingTime: 0,
    bookmarksCount: 0,
    likesCount: 0,
    commentsCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    engagementScore: 0
  });
  const [readingHistory, setReadingHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    bio: '',
    gender: '',
    country: '',
    language: '',
    dob: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedProfilePicture, setSelectedProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (user) {
      fetchAllUserData();
    }
  }, [user]);

  // Add a refresh mechanism when the component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchAllUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const fetchAllUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch(addToast({
          type: 'error',
          title: 'Authentication Error',
          message: 'Please login to view your profile'
        }));
        return;
      }

      // Fetch updated user profile data
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true,
        });
        
        if (userResponse.data && userResponse.data.user) {
          // Update localStorage and Redux store
          localStorage.setItem('user', JSON.stringify(userResponse.data.user));
          dispatch(updateUser(userResponse.data.user));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }

      // Fetch user statistics
      try {
        const statsResponse = await axios.get(`${API_BASE_URL}/user/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true,
        });
        
        if (statsResponse.data && statsResponse.data.stats) {
          setUserStats(statsResponse.data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      // Fetch reading history
      try {
        const historyResponse = await axios.get(`${API_BASE_URL}/user/reading-history`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true,
        });
        
        if (historyResponse.data && historyResponse.data.history) {
          setReadingHistory(historyResponse.data.history);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }

      // Fetch user badges
      try {
        const badgesResponse = await axios.get(`${API_BASE_URL}/user/badges`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true,
        });
        
        if (badgesResponse.data && badgesResponse.data.badges) {
          setBadges(badgesResponse.data.badges);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      dispatch(addToast({
        type: 'error',
        title: 'Failed to Load Profile',
        message: 'Unable to fetch your profile data'
      }));
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeType) => {
    const icons = {
      'first_read': '📖',
      'streak_7': '🔥',
      'streak_30': '💪',
      'bookmark_10': '🔖',
      'comment_master': '💬',
      'news_explorer': '🌍',
      'early_bird': '🌅',
      'night_owl': '🦉'
    };
    return icons[badgeType] || '🏆';
  };

  const formatReadingTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEditProfile = () => {
    setEditForm({
      username: user?.username || '',
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.profile?.bio || '',
      gender: user?.profile?.gender || '',
      country: user?.profile?.country || '',
      language: user?.profile?.language || '',
      dob: user?.profile?.dob ? user.profile.dob.split('T')[0] : ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      username: '',
      name: '',
      email: '',
      phone: '',
      bio: '',
      gender: '',
      country: '',
      language: '',
      dob: ''
    });
    setSelectedProfilePicture(null);
    setPreviewUrl('');
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdateLoading(true);
      
      const formData = new FormData();
      formData.append('username', editForm.username);
      formData.append('name', editForm.name);
      formData.append('email', editForm.email);
      formData.append('phone', editForm.phone);
      formData.append('bio', editForm.bio);
      formData.append('gender', editForm.gender);
      formData.append('country', editForm.country);
      formData.append('language', editForm.language);
      if (editForm.dob) {
        formData.append('dob', editForm.dob);
      }
      
      // Add profile picture if selected
      if (selectedProfilePicture) {
        formData.append('profilePicture', selectedProfilePicture);
      }

      const response = await axios.put(`${API_BASE_URL}/user/profile/update`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update Redux store with new user data
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch(updateUser(updatedUser));
        
        dispatch(addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully!'
        }));
        setIsEditing(false);
        setSelectedProfilePicture(null);
        setPreviewUrl('');
        
        // Refresh all user data
        fetchAllUserData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch(addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.message || 'Failed to update profile'
      }));
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading your profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Profile Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white">
              <div className="row align-items-center">
                <div className="col-md-3 text-center">
                  {user?.profile?.profilePicture && showProfileImage ? (
                    <img 
                      src={user.profile.profilePicture}
                      alt="Profile"
                      className="rounded-circle border border-white"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      onError={() => setShowProfileImage(false)}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center border border-white"
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        fontSize: '36px', 
                        fontWeight: 'bold'
                      }}
                    >
                      {user?.username?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <h2 className="mb-2">{user?.name || user?.username || 'User'}</h2>
                  <p className="mb-1 opacity-75">
                    <i className="fas fa-envelope me-2"></i>
                    {user?.email || 'No email provided'}
                  </p>
                  <p className="mb-1 opacity-75">
                    <i className="fas fa-calendar me-2"></i>
                    Member since {formatDate(user?.createdAt || new Date())}
                  </p>
                  {user?.profile?.bio && (
                    <p className="mb-0 opacity-75">
                      <i className="fas fa-quote-left me-2"></i>
                      {user.profile.bio}
                    </p>
                  )}
                </div>
                <div className="col-md-3 text-center">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <h3 className="mb-0">{userStats.currentStreak || 0}</h3>
                      <small className="opacity-75">Current Streak</small>
                    </div>
                    <div className="col-12">
                      <h3 className="mb-0">{userStats.articlesRead || 0}</h3>
                      <small className="opacity-75">Articles Read</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-fill">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                👤 User Details
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                📚 Reading History
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'badges' ? 'active' : ''}`}
                onClick={() => setActiveTab('badges')}
              >
                🏆 Badges
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row">
          {/* Quick Stats */}
          <div className="col-md-8">
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <i className="fas fa-clock text-primary fs-2 mb-2"></i>
                    <h4 className="text-primary">{formatReadingTime(userStats.totalReadingTime || 0)}</h4>
                    <p className="mb-0 text-muted">Total Reading Time</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <i className="fas fa-bookmark text-success fs-2 mb-2"></i>
                    <h4 className="text-success">{userStats.bookmarksCount || 0}</h4>
                    <p className="mb-0 text-muted">Bookmarks</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <i className="fas fa-heart text-danger fs-2 mb-2"></i>
                    <h4 className="text-danger">{userStats.likesCount || 0}</h4>
                    <p className="mb-0 text-muted">Likes Given</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <i className="fas fa-comments text-info fs-2 mb-2"></i>
                    <h4 className="text-info">{userStats.commentsCount || 0}</h4>
                    <p className="mb-0 text-muted">Comments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Badges */}
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">Recent Badges</h5>
              </div>
              <div className="card-body">
                {badges && badges.length > 0 ? (
                  badges.slice(0, 3).map((badge, index) => (
                    <div key={index} className="d-flex align-items-center mb-3">
                      <span className="me-3" style={{ fontSize: '28px' }}>
                        {getBadgeIcon(badge.type)}
                      </span>
                      <div>
                        <h6 className="mb-0">{badge.name}</h6>
                        <small className="text-muted">{badge.description}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted">
                    <i className="fas fa-trophy fs-1 mb-3 opacity-50"></i>
                    <p>No badges earned yet</p>
                    <small>Keep reading to unlock achievements!</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  Personal Information
                </h5>
                {!isEditing ? (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleEditProfile}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit Profile
                  </button>
                ) : (
                  <div>
                    <button 
                      className="btn btn-success btn-sm me-2"
                      onClick={handleUpdateProfile}
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Save
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleCancelEdit}
                    >
                      <i className="fas fa-times me-1"></i>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body">
                {!isEditing ? (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Username</label>
                      <p className="fw-bold">{user?.username || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Full Name</label>
                      <p className="fw-bold">{user?.name || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Email</label>
                      <p className="fw-bold">{user?.email || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Phone</label>
                      <p className="fw-bold">{user?.phone || 'Not provided'}</p>
                    </div>
                    {user?.profile?.gender && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted">Gender</label>
                        <p className="fw-bold">{user.profile.gender}</p>
                      </div>
                    )}
                    {user?.profile?.dob && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted">Date of Birth</label>
                        <p className="fw-bold">{formatDate(user.profile.dob)}</p>
                      </div>
                    )}
                    {user?.profile?.country && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted">Country</label>
                        <p className="fw-bold">{user.profile.country}</p>
                      </div>
                    )}
                    {user?.profile?.language && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted">Language</label>
                        <p className="fw-bold">{user.profile.language}</p>
                      </div>
                    )}
                    {user?.profile?.bio && (
                      <div className="col-12 mb-3">
                        <label className="form-label text-muted">Bio</label>
                        <p className="fw-bold">{user.profile.bio}</p>
                      </div>
                    )}
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Account Status</label>
                      <p className="fw-bold">
                        <span className={`badge ${user?.isVerified ? 'bg-success' : 'bg-warning'}`}>
                          {user?.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Member Since</label>
                      <p className="fw-bold">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.username}
                        onChange={(e) => handleFormChange('username', e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editForm.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        value={editForm.gender}
                        onChange={(e) => handleFormChange('gender', e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editForm.dob}
                        onChange={(e) => handleFormChange('dob', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.country}
                        onChange={(e) => handleFormChange('country', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Language</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.language}
                        onChange={(e) => handleFormChange('language', e.target.value)}
                        placeholder="Enter preferred language"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Profile Picture</label>
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {previewUrl ? (
                            <img 
                              src={previewUrl}
                              alt="Preview"
                              className="rounded-circle"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                          ) : user?.profile?.profilePicture ? (
                            <img 
                              src={user.profile.profilePicture}
                              alt="Current Profile"
                              className="rounded-circle"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                              style={{ width: '60px', height: '60px', fontSize: '20px' }}
                            >
                              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                          />
                          <small className="text-muted">Choose a new profile picture (JPG, PNG, GIF)</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editForm.bio}
                        onChange={(e) => handleFormChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  Quick Stats
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Engagement Score</span>
                    <strong className="text-primary">{userStats.engagementScore || 0}</strong>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Longest Streak</span>
                    <strong className="text-success">{userStats.longestStreak || 0} days</strong>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Total Articles</span>
                    <strong className="text-info">{userStats.articlesRead || 0}</strong>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Active Since</span>
                    <strong className="text-muted">
                      {Math.floor((Date.now() - new Date(user?.createdAt)) / (1000 * 60 * 60 * 24))} days
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Reading History
                </h5>
                <small className="text-muted">{readingHistory.length} articles read</small>
              </div>
              <div className="card-body">
                {readingHistory && readingHistory.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {readingHistory.slice(0, 10).map((item, index) => (
                      <div 
                        key={index} 
                        className="list-group-item d-flex justify-content-between align-items-start"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (item.article) {
                            // Create article object for modal
                            const modalArticle = {
                              title: item.article.title,
                              description: item.article.description,
                              link: item.article.link,
                              image_url: item.article.image_url,
                              publishedAt: item.article.publishedAt,
                              author: item.article.author,
                              source_name: item.article.source_name,
                              source_url: item.article.source_url,
                              source_icon: item.article.source_icon,
                              category: item.article.category,
                              country: item.article.country
                            };
                            setSelectedArticle(modalArticle);
                            setShowModal(true);
                          }
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="ms-2 me-auto">
                          <div className="fw-bold">{item.article?.title || 'Article Title'}</div>
                          <small className="text-muted">
                            Read on {formatDate(item.readAt || item.createdAt)}
                            {item.readCount > 1 && ` • Read ${item.readCount} times`}
                          </small>
                        </div>
                        <span className="badge bg-primary rounded-pill">
                          {formatReadingTime(item.readingTime || 5)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="fas fa-book-open fs-1 mb-3 opacity-50"></i>
                    <p>No reading history yet</p>
                    <small>Start reading articles to see your history here!</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-trophy me-2"></i>
                  All Badges ({badges.length})
                </h5>
              </div>
              <div className="card-body">
                {badges && badges.length > 0 ? (
                  <div className="row">
                    {badges.map((badge, index) => (
                      <div key={index} className="col-md-6 col-lg-4 mb-3">
                        <div className="card h-100">
                          <div className="card-body text-center">
                            <div style={{ fontSize: '48px' }} className="mb-3">
                              {getBadgeIcon(badge.type)}
                            </div>
                            <h6 className="card-title">{badge.name}</h6>
                            <p className="card-text text-muted small">{badge.description}</p>
                            <small className="text-muted">
                              Earned on {formatDate(badge.earnedAt || badge.createdAt)}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="fas fa-medal fs-1 mb-3 opacity-50"></i>
                    <p>No badges earned yet</p>
                    <small>Keep engaging with articles to unlock achievements!</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Article Modal */}
      {showModal && selectedArticle && (
        <ArticleModalSimple 
          article={selectedArticle}
          onClose={() => {
            setShowModal(false);
            setSelectedArticle(null);
            // Refresh data after closing modal to update reading count
            fetchAllUserData();
          }}
        />
      )}
    </div>
  );
};

export default UserProfile;
