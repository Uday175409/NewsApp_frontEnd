import React from 'react';
import { useSelector } from 'react-redux';
import '../css/UserAvatar.css';

const UserAvatar = ({ 
  size = 'medium', 
  className = '', 
  showName = false, 
  clickable = false,
  onClick,
  user: propUser // Allow passing user as prop for flexibility
}) => {
  const currentUser = useSelector(state => state.auth.user);
  const user = propUser || currentUser;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'avatar-small';
      case 'large':
        return 'avatar-large';
      case 'xl':
        return 'avatar-xl';
      default:
        return 'avatar-medium';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const profilePictureUrl = user?.profile?.profilePicture;
  const userName = user?.username || user?.name || 'User';
  const initials = getInitials(userName);

  return (
    <div 
      className={`user-avatar ${getSizeClasses()} ${clickable ? 'clickable' : ''} ${className}`}
      onClick={clickable ? onClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className="avatar-container">
        {profilePictureUrl ? (
          <img 
            src={profilePictureUrl} 
            alt={`${userName}'s profile`}
            className="avatar-image"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.target.style.display = 'none';
              const initialsElement = e.target.parentNode.querySelector('.avatar-initials');
              if (initialsElement) {
                initialsElement.style.display = 'flex';
              }
            }}
          />
        ) : (
          <div className="avatar-initials">
            {initials}
          </div>
        )}
        {profilePictureUrl && (
          <div 
            className="avatar-initials"
            style={{ display: 'none' }}
          >
            {initials}
          </div>
        )}
      </div>
      {showName && (
        <span className="avatar-name">{userName}</span>
      )}
    </div>
  );
};

export default UserAvatar;
