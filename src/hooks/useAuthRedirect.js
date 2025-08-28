import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAuthRedirect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Create axios interceptor for 401 responses
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check if it's a 401 Unauthorized error
        if (error.response?.status === 401) {
          console.log('🚨 401 Unauthorized - Redirecting to login');
          
          // Clear user from Redux
          dispatch({ type: 'auth/logout' });
          
          // Set message for login page
          const message = error.response?.data?.message || 'Your session has expired. Please log in again.';
          sessionStorage.setItem('authMessage', message);
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          
          // Navigate to login page
          navigate('/login', { replace: true });
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [dispatch, navigate]);
};

export default useAuthRedirect;
