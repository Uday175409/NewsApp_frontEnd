import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchActivityAnalytics,
  logout 
} from '../../store/slices/adminSlice';
import { useTheme } from '../../contexts/ThemeContext';
import AdminLayout from '../../components/shared/admin/AdminLayout';
import StatsCard from '../../components/shared/admin/StatsCard';
import Counter from '../../components/ui/counter/Counter';

const Analytics = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { 
    isAuthenticated, 
    analytics,
    loading, 
    error,
    admin 
  } = useSelector(state => state.admin);

  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [isAuthenticated, timeRange]);

  const fetchAnalytics = () => {
    // Make sure we're explicitly passing the timeRange as an object
    dispatch(fetchActivityAnalytics({ timeRange }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`min-vh-100 ${theme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
      {/* Header */}
      <nav className={`navbar navbar-expand-lg ${
        theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-white'
      } shadow-sm`}>
        <div className="container-fluid">
          <div className="navbar-brand fw-bold">
            <button 
              className="btn btn-link text-decoration-none p-0 me-2"
              onClick={() => navigate('/admin/dashboard')}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <i className="fas fa-chart-line text-primary me-2"></i>
            Analytics & Reports
          </div>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button 
                className="btn btn-link nav-link dropdown-toggle text-decoration-none"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-user-circle me-1"></i>
                {admin?.email}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate('/admin/users')}
                  >
                    <i className="fas fa-users me-2"></i>
                    Users
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Time Range Selector */}
        <div className="row mb-4">
          <div className="col-12">
            <div className={`card border-0 shadow-sm ${
              theme === 'dark' ? 'bg-dark border-secondary' : ''
            }`}>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h5 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <i className="fas fa-calendar-alt me-2"></i>
                      Time Period Analysis
                    </h5>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex gap-2 justify-content-md-end">
                      {[
                        { value: '7days', label: '7 Days' },
                        { value: '30days', label: '30 Days' },
                        { value: '90days', label: '90 Days' },
                        { value: '365days', label: '1 Year' }
                      ].map((range) => (
                        <button
                          key={range.value}
                          className={`btn btn-sm ${
                            timeRange === range.value 
                              ? 'btn-primary' 
                              : 'btn-outline-primary'
                          }`}
                          onClick={() => setTimeRange(range.value)}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading analytics...</span>
            </div>
            <p className="mt-3 text-muted">Loading analytics data...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        ) : analytics ? (
          <>
            {/* Overview Cards */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-body text-center">
                    <div className="text-primary mb-2">
                      <i className="fas fa-user-plus fa-2x"></i>
                    </div>
                    <h4 className={`mb-1 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <Counter value={analytics.totalRegistrations} />
                    </h4>
                    <small className="text-muted">New Registrations</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-body text-center">
                    <div className="text-success mb-2">
                      <i className="fas fa-eye fa-2x"></i>
                    </div>
                    <h4 className={`mb-1 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <Counter value={analytics.totalViews} />
                    </h4>
                    <small className="text-muted">Total Views</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-body text-center">
                    <div className="text-danger mb-2">
                      <i className="fas fa-heart fa-2x"></i>
                    </div>
                    <h4 className={`mb-1 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <Counter value={analytics.totalLikes} />
                    </h4>
                    <small className="text-muted">Total Likes</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-body text-center">
                    <div className="text-warning mb-2">
                      <i className="fas fa-bookmark fa-2x"></i>
                    </div>
                    <h4 className={`mb-1 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <Counter value={analytics.totalBookmarks} />
                    </h4>
                    <small className="text-muted">Total Bookmarks</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Registrations Chart */}
            <div className="row mb-4">
              <div className="col-12">
                <div className={`card border-0 shadow-sm ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-header">
                    <h5 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <i className="fas fa-chart-line me-2"></i>
                      Daily Registrations Trend
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {analytics.dailyRegistrations?.slice(-7).map((day, index) => (
                        <div key={index} className="col text-center">
                          <div 
                            className="bg-primary rounded mb-2 mx-auto"
                            style={{
                              height: `${Math.max(20, (day.count / Math.max(...analytics.dailyRegistrations.map(d => d.count))) * 120)}px`,
                              width: '30px'
                            }}
                          ></div>
                          <small className="text-muted d-block">{formatDate(day._id)}</small>
                          <strong className={`${theme === 'dark' ? 'text-light' : ''}`}>
                            <Counter value={day.count} />
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Countries and Languages */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-header">
                    <h5 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <i className="fas fa-globe me-2"></i>
                      Top Countries
                    </h5>
                  </div>
                  <div className="card-body">
                    {analytics.topCountries?.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {analytics.topCountries.map((country, index) => (
                          <div key={index} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                            <div className="d-flex align-items-center">
                              <span className={`badge bg-primary me-2 ${index + 1}`}>
                                {index + 1}
                              </span>
                              <span className={theme === 'dark' ? 'text-light' : ''}>
                                {country._id || 'Not specified'}
                              </span>
                            </div>
                            <span className="badge bg-secondary">
                              <Counter value={country.count} />
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-center">No country data available</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-header">
                    <h5 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <i className="fas fa-language me-2"></i>
                      Top Languages
                    </h5>
                  </div>
                  <div className="card-body">
                    {analytics.topLanguages?.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {analytics.topLanguages.map((language, index) => (
                          <div key={index} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                            <div className="d-flex align-items-center">
                              <span className={`badge bg-success me-2 ${index + 1}`}>
                                {index + 1}
                              </span>
                              <span className={theme === 'dark' ? 'text-light' : ''}>
                                {language._id || 'English'}
                              </span>
                            </div>
                            <span className="badge bg-secondary">
                              <Counter value={language.count} />
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-center">No language data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="row">
              <div className="col-12">
                <div className={`card border-0 shadow-sm ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-header">
                    <h5 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <i className="fas fa-fire me-2"></i>
                      Activity Heatmap ({analytics.period})
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-1">
                      {analytics.dailyActivity?.map((day, index) => (
                        <div key={index} className="col">
                          <div 
                            className={`rounded p-1 text-center small ${
                              day.totalActivity > 10 ? 'bg-success' :
                              day.totalActivity > 5 ? 'bg-warning' :
                              day.totalActivity > 0 ? 'bg-info' : 'bg-light'
                            }`}
                            style={{ height: '60px' }}
                            title={`${formatDate(day._id)}: ${day.totalActivity} activities`}
                          >
                            <div className="text-white fw-bold">
                              <Counter value={day.totalActivity} />
                            </div>
                            <div className="text-white" style={{ fontSize: '10px' }}>
                              {formatDate(day._id)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 d-flex justify-content-center align-items-center">
                      <small className="text-muted me-2">Less</small>
                      <div className="d-flex gap-1">
                        <div className="bg-light rounded" style={{ width: '12px', height: '12px' }}></div>
                        <div className="bg-info rounded" style={{ width: '12px', height: '12px' }}></div>
                        <div className="bg-warning rounded" style={{ width: '12px', height: '12px' }}></div>
                        <div className="bg-success rounded" style={{ width: '12px', height: '12px' }}></div>
                      </div>
                      <small className="text-muted ms-2">More</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No analytics data available</h5>
            <p className="text-muted">Analytics data will appear here once users start interacting with the platform</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
