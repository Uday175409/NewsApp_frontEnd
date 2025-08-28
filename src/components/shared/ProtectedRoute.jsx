import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchUserProfile } from '../../store/slices/authSlice';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // If we have a token but no user data, try to fetch user profile
    if (token && !user && !loading) {
      dispatch(fetchUserProfile());
    }
  }, [token, user, loading, dispatch]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If no token or not authenticated, redirect to login
  if (!token || !isAuthenticated) {
    // Store current location for redirect after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    sessionStorage.setItem('authMessage', 'Please log in to access this page.');
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
