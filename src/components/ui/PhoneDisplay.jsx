import React, { useState, useEffect } from 'react';
import './PhoneDisplay.css';

// Animated Phone Number Display Component
export function AnimatedPhoneDisplay({ phone, theme = 'light' }) {
  const [displayedPhone, setDisplayedPhone] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!phone) {
      setDisplayedPhone('Not provided');
      return;
    }

    setIsAnimating(true);
    setDisplayedPhone('');
    
    // Clean and format phone number
    const cleanPhone = phone.toString().replace(/\D/g, '');
    const formattedPhone = formatPhoneNumber(cleanPhone);
    
    // Animate phone number appearance
    let index = 0;
    const interval = setInterval(() => {
      if (index <= formattedPhone.length) {
        setDisplayedPhone(formattedPhone.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [phone]);

  const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = phoneNumberString.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    
    if (cleaned.length === 11 && cleaned[0] === '1') {
      const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    
    return phoneNumberString;
  };

  return (
    <div className={`animated-phone-display ${theme === 'dark' ? 'dark' : 'light'}`}>
      <span className={`phone-number ${isAnimating ? 'animating' : ''}`}>
        {displayedPhone}
        {isAnimating && <span className="cursor">|</span>}
      </span>
    </div>
  );
}

// Stylized Phone Display with Icon
export function StylizedPhoneDisplay({ phone, theme = 'light' }) {
  if (!phone) {
    return (
      <div className={`stylized-phone ${theme === 'dark' ? 'dark' : 'light'}`}>
        <i className="fas fa-phone-slash text-muted me-2"></i>
        <span className="text-muted">Not provided</span>
      </div>
    );
  }

  const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = phoneNumberString.toString().replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    
    if (cleaned.length === 11 && cleaned[0] === '1') {
      const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    
    return phoneNumberString;
  };

  return (
    <div className={`stylized-phone ${theme === 'dark' ? 'dark' : 'light'}`}>
      <div className="phone-icon-wrapper">
        <i className="fas fa-phone"></i>
      </div>
      <div className="phone-content">
        <span className="phone-number">{formatPhoneNumber(phone)}</span>
        <div className="phone-actions">
          <button 
            className="btn btn-sm btn-outline-primary me-1" 
            onClick={() => window.open(`tel:${phone}`)}
            title="Call"
          >
            <i className="fas fa-phone"></i>
          </button>
          <button 
            className="btn btn-sm btn-outline-success" 
            onClick={() => window.open(`sms:${phone}`)}
            title="SMS"
          >
            <i className="fas fa-sms"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

// Cool Gradient Phone Display
export function GradientPhoneDisplay({ phone, theme = 'light' }) {
  if (!phone) {
    return (
      <div className="gradient-phone not-provided">
        <span>Not provided</span>
      </div>
    );
  }

  const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = phoneNumberString.toString().replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return {
          area: match[1],
          exchange: match[2],
          number: match[3]
        };
      }
    }
    
    return {
      area: phone.slice(0, 3),
      exchange: phone.slice(3, 6),
      number: phone.slice(6)
    };
  };

  const phoneParts = formatPhoneNumber(phone);

  return (
    <div className={`gradient-phone ${theme === 'dark' ? 'dark' : 'light'}`}>
      <div className="phone-segment area">({phoneParts.area})</div>
      <div className="phone-segment exchange">{phoneParts.exchange}</div>
      <div className="phone-segment number">-{phoneParts.number}</div>
    </div>
  );
}

export default AnimatedPhoneDisplay;
