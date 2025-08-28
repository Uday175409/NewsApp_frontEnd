import React from 'react';
import { Heart, Eye, MessageCircle, Bookmark, Share2, ThumbsUp } from 'lucide-react';
import Counter from './Counter';
import './Counter.css';

// Helper function to format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to get digit places based on number
const getPlaces = (num) => {
  if (num >= 1000) return [1000, 100, 10, 1];
  if (num >= 100) return [100, 10, 1];
  if (num >= 10) return [10, 1];
  return [1];
};

// Bootstrap-compatible Counter for Profile Stats
export function ProfileStatCounter({ 
  value, 
  animated = true,
  bootstrapClass = "h3 text-primary mb-1",
  size = "medium",
  minimal = false
}) {
  if (minimal || !animated) {
    return (
      <span className={bootstrapClass}>
        {formatNumber(value)}
      </span>
    );
  }

  return (
    <Counter 
      value={value} 
      size={size}
      theme="transparent"
      places={getPlaces(value)}
      bootstrapClass={bootstrapClass}
      minimal={false}
      gradientHeight={0}
      containerStyle={{ display: 'inline-block' }}
    />
  );
}

// Icon Counter Component (Bootstrap badge style)
export function IconCounter({ 
  type, 
  value, 
  animated = false, 
  onClick, 
  className = "",
  showLabel = true,
  variant = "default"
}) {
  const icons = {
    likes: Heart,
    views: Eye,
    comments: MessageCircle,
    bookmarks: Bookmark,
    shares: Share2,
    upvotes: ThumbsUp,
  };

  const labels = {
    likes: 'Likes',
    views: 'Views',
    comments: 'Comments',
    bookmarks: 'Bookmarks',
    shares: 'Shares',
    upvotes: 'Upvotes',
  };

  const Icon = icons[type] || Heart;

  // Bootstrap badge style
  if (variant === "badge") {
    return (
      <span 
        className={`badge bg-${type === 'likes' ? 'danger' : type === 'views' ? 'info' : type === 'comments' ? 'success' : type === 'bookmarks' ? 'warning' : 'primary'} ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <Icon className="me-1" size={12} />
        {animated && value <= 9999 ? (
          <Counter 
            value={value} 
            size="small"
            theme="transparent"
            places={getPlaces(value)}
            minimal={true}
          />
        ) : (
          formatNumber(value)
        )}
      </span>
    );
  }

  // Default icon counter style
  if (animated && value <= 9999) {
    return (
      <div 
        className={`icon-counter ${type} ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <Icon className="icon" />
        <Counter 
          value={value} 
          size="small"
          theme="transparent"
          places={getPlaces(value)}
          minimal={true}
          containerStyle={{ display: 'inline-block' }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`icon-counter ${type} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Icon className="icon" />
      <span>{formatNumber(value)}</span>
      {showLabel && <span className="visually-hidden">{labels[type]}</span>}
    </div>
  );
}

// Bootstrap Card Counter
export function CardCounter({ 
  title,
  value, 
  icon: Icon,
  color = "primary",
  animated = true,
  theme = "light" // 'light' or 'dark'
}) {
  const cardClass = theme === 'dark' ? 'bg-dark border-secondary' : '';
  const textClass = theme === 'dark' ? 'text-light' : '';
  
  return (
    <div className={`card text-center h-100 ${cardClass}`}>
      <div className="card-body">
        {Icon && (
          <Icon className={`mb-2 text-${color}`} size={24} />
        )}
        <div className={`display-6 fw-bold text-${color} mb-1`}>
          {animated ? (
            <ProfileStatCounter 
              value={value}
              bootstrapClass={`display-6 fw-bold text-${color}`}
              animated={true}
            />
          ) : (
            formatNumber(value)
          )}
        </div>
        <small className={`text-muted ${textClass}`}>{title}</small>
      </div>
    </div>
  );
}

// Animated Metric Counter (for dashboards)
export function MetricCounter({ 
  type = "primary", 
  value, 
  label, 
  size = "medium",
  animated = true,
  theme = "primary",
  icon: CustomIcon,
  className = "",
  bootstrapStyle = false
}) {
  const typeIcons = {
    likes: Heart,
    views: Eye,
    comments: MessageCircle,
    bookmarks: Bookmark,
    shares: Share2,
    upvotes: ThumbsUp,
  };

  const Icon = CustomIcon || typeIcons[type] || null;

  if (bootstrapStyle) {
    return (
      <div className={`d-flex align-items-center ${className}`}>
        {Icon && (
          <div className={`me-3 p-2 rounded-circle bg-${theme} text-white`}>
            <Icon size={20} />
          </div>
        )}
        <div>
          <div className={`fw-bold text-${theme}`}>
            {animated ? (
              <ProfileStatCounter 
                value={value}
                bootstrapClass={`fw-bold text-${theme}`}
                size={size}
              />
            ) : (
              formatNumber(value)
            )}
          </div>
          {label && (
            <small className="text-muted">{label}</small>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {Icon && (
        <div className={`p-2 rounded-full bg-gradient-to-r ${getIconBackground(type)}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <div className="flex flex-col">
        {animated ? (
          <Counter 
            value={value}
            size={size}
            theme={theme}
            places={getPlaces(value)}
          />
        ) : (
          <div className={`counter-counter counter-${theme} counter-${size}`}>
            {formatNumber(value)}
          </div>
        )}
        {label && (
          <span className="text-sm text-gray-500 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}

// Statistics Dashboard Counter (Bootstrap Card style)
export function StatCounter({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon,
  size = "large",
  theme = "primary",
  animated = true,
  className = "",
  darkMode = false
}) {
  const cardClass = darkMode ? 'bg-dark border-secondary text-light' : 'bg-white';
  
  return (
    <div className={`card border-0 shadow-sm h-100 ${cardClass} ${className}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <h6 className="card-subtitle mb-2 text-muted text-uppercase small fw-semibold">
              {title}
            </h6>
            <div className="mb-2">
              {animated ? (
                <ProfileStatCounter 
                  value={value}
                  bootstrapClass={`display-6 fw-bold text-${theme}`}
                  size={size}
                />
              ) : (
                <div className={`display-6 fw-bold text-${theme}`}>
                  {formatNumber(value)}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="card-text small text-muted mb-0">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div className={`small mt-1 ${
                trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-muted'
              }`}>
                <span>{trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}</span>
                <span className="ms-1">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-2 rounded bg-${theme} text-white`}>
              <Icon size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function for icon backgrounds (Tailwind classes)
function getIconBackground(type) {
  const backgrounds = {
    likes: 'from-red-500 to-pink-500',
    views: 'from-blue-500 to-cyan-500',
    comments: 'from-green-500 to-teal-500',
    bookmarks: 'from-purple-500 to-pink-500',
    shares: 'from-orange-500 to-red-500',
    upvotes: 'from-indigo-500 to-purple-500',
    primary: 'from-blue-500 to-purple-500',
    success: 'from-green-500 to-teal-500',
    danger: 'from-red-500 to-pink-500',
    warning: 'from-yellow-500 to-orange-500',
    info: 'from-cyan-500 to-blue-500',
    dark: 'from-gray-700 to-gray-900',
  };
  return backgrounds[type] || backgrounds.primary;
}

export default Counter;
