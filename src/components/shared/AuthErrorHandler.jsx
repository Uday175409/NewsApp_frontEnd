import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AuthErrorHandler = ({ children }) => {
  const { error } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle authentication errors that indicate unauthorized access
    if (error) {
      const unauthorizedMessages = [
        'unauthorized',
        'token expired',
        'invalid token',
        'authentication required',
        'access denied'
      ];

      const isUnauthorizedError = unauthorizedMessages.some(msg => 
        error.toLowerCase().includes(msg)
      );

      if (isUnauthorizedError) {
        // Clear the error
        dispatch({ type: 'auth/clearError' });
        
        // Set message for login page
        sessionStorage.setItem('authMessage', error);
        
        // Redirect to login
        navigate('/login', { replace: true });
      }
    }
  }, [error, dispatch, navigate]);

  return children;
};

export default AuthErrorHandler;
