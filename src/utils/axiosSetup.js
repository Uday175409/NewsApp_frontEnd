import axios from 'axios';

// Setup axios interceptors for admin authentication
const setupAxiosInterceptors = () => {
  // Request interceptor to add admin token
  axios.interceptors.request.use(
    (config) => {
      // Check if it's an admin route
      if (config.url?.includes('/admin/')) {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
          // Remove any existing authorization header first
          delete config.headers.Authorization;
          // Set the admin token
          config.headers.Authorization = `Bearer ${adminToken}`;
          console.log('Axios interceptor - Setting admin token for:', config.url);
        }
      } else {
        // For non-admin routes, use regular user token if needed
        // But only if no admin is currently logged in
        const adminToken = localStorage.getItem('adminToken');
        const userToken = localStorage.getItem('token');
        
        if (!adminToken && userToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${userToken}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle admin auth errors
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // If admin route and unauthorized, clear admin token
        if (error.config?.url?.includes('/admin/')) {
          console.log('Axios interceptor - Admin auth failed, clearing admin tokens');
          localStorage.removeItem('adminToken');
          
          // Redirect to admin login if current page is admin
          if (window.location.pathname.startsWith('/admin/') && 
              window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        } else {
          // For non-admin routes, clear user tokens but keep admin tokens
          console.log('Axios interceptor - User auth failed, clearing user tokens');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirect to user login if not on admin pages
          if (!window.location.pathname.startsWith('/admin/') && 
              window.location.pathname !== '/login' && 
              window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
