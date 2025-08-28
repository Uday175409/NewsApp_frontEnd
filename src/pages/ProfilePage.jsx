import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Profile from '../components/shared/Profile.jsx'

const ProfilePage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-vh-100 transition-colors duration-300 ${
      theme === 'dark' ? 'dark-theme' : ''
    }`} style={{
      backgroundColor: theme === 'dark' ? 'var(--bg-dark)' : 'var(--bg-light)'
    }}>
  <Profile />
    </div>
  );
};

export default ProfilePage;
