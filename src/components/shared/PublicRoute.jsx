import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();
  const token = localStorage.getItem('token');

  // If user is authenticated and trying to access login/register, redirect to home
  if (token && isAuthenticated) {
    // Get the intended destination from location state, or default to home
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // If not authenticated, render the public component (login/register)
  return children;
};

export default PublicRoute;
