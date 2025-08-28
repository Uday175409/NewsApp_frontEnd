import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Counter from '../../ui/counter/Counter';

const StatsCard = ({ 
  icon, 
  iconColor = 'primary', 
  title, 
  value, 
  subtitle, 
  trend, 
  onClick,
  className = '' 
}) => {
  const { theme } = useTheme();

  const cardClass = `card border-0 shadow-sm h-100 ${
    theme === 'dark' ? 'bg-dark border-secondary' : ''
  } ${onClick ? 'cursor-pointer' : ''} ${className}`;

  const cardContent = (
    <div className="card-body text-center">
      <div className={`text-${iconColor} mb-3`}>
        <i className={`${icon} fa-2x`}></i>
      </div>
      <h4 className={`mb-1 ${theme === 'dark' ? 'text-light' : ''}`}>
        <Counter value={value} />
      </h4>
      <h6 className={`card-title mb-2 ${theme === 'dark' ? 'text-light' : ''}`}>
        {title}
      </h6>
      {subtitle && (
        <p className="card-text text-muted small">{subtitle}</p>
      )}
      {trend && (
        <div className={`small ${trend.direction === 'up' ? 'text-success' : trend.direction === 'down' ? 'text-danger' : 'text-muted'}`}>
          <i className={`fas fa-arrow-${trend.direction === 'up' ? 'up' : trend.direction === 'down' ? 'down' : 'right'} me-1`}></i>
          {trend.value}% {trend.period}
        </div>
      )}
    </div>
  );

  return onClick ? (
    <div className={cardClass} onClick={onClick} style={{ cursor: 'pointer' }}>
      {cardContent}
    </div>
  ) : (
    <div className={cardClass}>
      {cardContent}
    </div>
  );
};

export default StatsCard;
