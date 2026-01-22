import React from 'react';
import { PackageOpen } from 'lucide-react'; // Default icon
import './Empty.css';

const Empty = ({ 
  title = "No data found", 
  description = "There is nothing to display here at the moment.", 
  icon: Icon = PackageOpen,
  actionLabel, 
  onAction,
  variant = "default"
}) => {
  return (
    <div className={`empty-state-container ${variant}`}>
      <div className="empty-state-icon-wrapper">
        <Icon size={variant === 'small' ? 32 : 48} strokeWidth={1.5} />
      </div>
      
      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
        
        {actionLabel && onAction && (
          <button className="empty-state-button" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default Empty;