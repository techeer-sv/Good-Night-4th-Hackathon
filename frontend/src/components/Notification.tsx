import React, { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`notification notification-${type}`}>
      <span>{message}</span>
      <button className="notification-close" onClick={onClose} aria-label="Close notification">
        ×
      </button>
    </div>
  );
};

export default Notification;