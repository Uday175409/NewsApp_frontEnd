import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, adminLogout, initializeAdminAuth } from '../../store/slices/adminSlice';
import { useTheme } from '../../contexts/ThemeContext';
import AdminLayout from '../../components/shared/admin/AdminLayout';
import StatsCard from '../../components/shared/admin/StatsCard';
import Counter from '../../components/ui/counter/Counter';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { 
    isAuthenticated, 
    dashboardStats, 
    loading, 
    error,
    admin 
  } = useSelector(state => state.admin);

  useEffect(() => {
    // Initialize admin auth from localStorage
    dispatch(initializeAdminAuth());
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    // Always try to fetch dashboard stats
    dispatch(fetchDashboardStats());
  }, [dispatch, navigate]);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`min-vh-100 ${
      theme === 'dark' ? 'bg-dark' : 'bg-light'
    }`}>
      {/* Header */}
      <nav className={`navbar navbar-expand-lg ${
        theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-white'
      } shadow-sm`}>
        <div className="container-fluid">
          <div className="navbar-brand fw-bold">
            <i className="fas fa-shield-alt text-primary me-2"></i>
            Admin Dashboard
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
                    onClick={() => navigate('/admin/users')}
                  >
                    <i className="fas fa-users me-2"></i>
                    Manage Users
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate('/admin/analytics')}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    Analytics
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
        {loading && !dashboardStats ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className={`mt-3 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>Loading dashboard statistics...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        ) : dashboardStats ? (
          <>
            {/* Quick Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-body text-center">
                    <div className="text-primary mb-2">
                      <i className="fas fa-users fa-2x"></i>
                    </div>
                    <h3 className={`mb-1 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <Counter value={dashboardStats.overview.totalUsers} />
                    </h3>
                    <p className={`mb-0 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>Total Users</p>
                    <small className="text-success">
                      <i className="fas fa-arrow-up me-1"></i>
                      +<Counter value={dashboardStats.overview.newUsersThisMonth} /> this month
                    </small>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-body text-center">
                    <div className="text-success mb-2">
                      <i className="fas fa-eye fa-2x"></i>
                    </div>
                    <h3 className={`mb-1 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <Counter value={dashboardStats.overview.totalViews} />
                    </h3>
                    <p className={`mb-0 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>Total Views</p>
                    <small className="text-info">
                      <i className="fas fa-users me-1"></i>
                      <Counter value={dashboardStats.overview.activeUsers} /> active users
                    </small>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-body text-center">
                    <div className="text-warning mb-2">
                      <i className="fas fa-bookmark fa-2x"></i>
                    </div>
                    <h3 className={`mb-1 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <Counter value={dashboardStats.overview.totalBookmarks} />
                    </h3>
                    <p className={`mb-0 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>Total Bookmarks</p>
                    <small className="text-danger">
                      <i className="fas fa-heart me-1"></i>
                      <Counter value={dashboardStats.overview.totalLikes} /> likes
                    </small>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-body text-center">
                    <div className="text-info mb-2">
                      <i className="fas fa-newspaper fa-2x"></i>
                    </div>
                    <h3 className={`mb-1 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <Counter value={dashboardStats.overview.totalArticles} />
                    </h3>
                    <p className={`mb-0 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>Articles in Database</p>
                    <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
                      <i className="fas fa-database me-1"></i>
                      Cached articles
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Analytics */}
            <div className="row">
              {/* Registration Trend */}
              <div className="col-md-6 mb-4">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-chart-line me-2"></i>
                      Registration Trend (Last 7 Days)
                    </h5>
                  </div>
                  <div className="card-body">
                    {dashboardStats.trends.registrationTrend.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>New Users</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardStats.trends.registrationTrend.map((item, index) => (
                              <tr key={index}>
                                <td>{new Date(item._id).toLocaleDateString()}</td>
                                <td>
                                  <span className="badge bg-primary">
                                    <Counter value={item.count} />
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className={`text-center py-3 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>
                        No registration data available for the last 7 days
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Countries */}
              <div className="col-md-6 mb-4">
                <div className={`card border-0 shadow-sm h-100 ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-globe me-2"></i>
                      Top Countries
                    </h5>
                  </div>
                  <div className="card-body">
                    {dashboardStats.trends.topCountries.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {dashboardStats.trends.topCountries.map((country, index) => (
                          <div key={index} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                            <span className={theme === 'dark' ? 'text-light' : ''}>
                              <i className="fas fa-flag me-2"></i>
                              {country._id || 'Unknown'}
                            </span>
                            <span className="badge bg-success rounded-pill">
                              <Counter value={country.count} />
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-center py-3 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>No country data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
              <div className="col-12">
                <div className={`card border-0 shadow-sm ${
                  theme === 'dark' ? 'bg-dark border-secondary' : ''
                }`}>
                  <div className={`card-header ${theme === 'dark' ? 'bg-secondary' : ''}`}> 
                    <h5 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
                      <i className="fas fa-bolt me-2"></i>
                      Quick Actions
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <button 
                          className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                          onClick={() => navigate('/admin/users')}
                        >
                          <i className="fas fa-users fa-2x mb-2"></i>
                          <span>Manage Users</span>
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                          onClick={() => navigate('/admin/analytics')}
                        >
                          <i className="fas fa-chart-bar fa-2x mb-2"></i>
                          <span>View Analytics</span>
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                          onClick={() => navigate('/admin/system')}
                        >
                          <i className="fas fa-server fa-2x mb-2"></i>
                          <span>System Health</span>
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button 
                          className="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                          onClick={() => navigate('/')}
                        >
                          <i className="fas fa-home fa-2x mb-2"></i>
                          <span>Main Site</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <i className={`fas fa-chart-line fa-3x mb-3 ${theme === 'dark' ? 'text-light opacity-50' : 'text-muted'}`}></i>
            <h5 className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>No data available</h5>
            <p className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Dashboard data will appear here once the system is running</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
