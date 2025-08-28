import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminLogout } from '../../../store/slices/adminSlice';
import { useTheme } from '../../../contexts/ThemeContext';

const AdminLayout = ({ children, title, breadcrumbs = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { admin } = useSelector(state => state.admin);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  return (
    <div className={`min-vh-100 ${theme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
      {/* Header */}
      <nav className={`navbar navbar-expand-lg ${
        theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-white'
      } shadow-sm`}>
        <div className="container-fluid">
          <div className="navbar-brand fw-bold">
            {breadcrumbs.length > 0 && (
              <button 
                className="btn btn-link text-decoration-none p-0 me-2"
                onClick={() => navigate('/admin/dashboard')}
              >
                <i className="fas fa-arrow-left"></i>
              </button>
            )}
            <i className="fas fa-shield-alt text-primary me-2"></i>
            {title}
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
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => navigate('/admin/analytics')}
                  >
                    <i className="fas fa-chart-line me-2"></i>
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

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="container-fluid py-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <i className="fas fa-home me-1"></i>
                  Dashboard
                </button>
              </li>
              {breadcrumbs.map((crumb, index) => (
                <li 
                  key={index}
                  className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                  aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                >
                  {index === breadcrumbs.length - 1 ? (
                    crumb.label
                  ) : (
                    <button 
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate(crumb.path)}
                    >
                      {crumb.label}
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="container-fluid py-4">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
