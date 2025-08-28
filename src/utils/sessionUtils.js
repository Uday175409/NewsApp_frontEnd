// Utility functions for admin/user session management

export const isAdminLoggedIn = () => {
  return !!localStorage.getItem('adminToken');
};

export const isUserLoggedIn = () => {
  return !!localStorage.getItem('token') && !isAdminLoggedIn();
};

export const clearAllTokens = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentSessionType = () => {
  if (isAdminLoggedIn()) return 'admin';
  if (isUserLoggedIn()) return 'user';
  return 'none';
};

// Check if current route should be accessible based on session
export const canAccessRoute = (route) => {
  const sessionType = getCurrentSessionType();
  
  if (route.startsWith('/admin/')) {
    return sessionType === 'admin';
  }
  
  // Protected user routes
  const protectedRoutes = ['/profile', '/bookmarks', '/profile/edit'];
  if (protectedRoutes.some(pr => route.startsWith(pr))) {
    return sessionType === 'user';
  }
  
  // Public routes accessible to all
  return true;
};
