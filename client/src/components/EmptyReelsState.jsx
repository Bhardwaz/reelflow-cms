import React from 'react';

const EmptyReelsState = ({ categoryName, onReset }) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '40px 20px',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  };

  const iconContainerStyle = {
    marginBottom: '24px',
    color: '#D1D5DB' // Light gray
  };

  const headingStyle = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1F2937', // Dark gray/black
    margin: '0 0 8px 0',
    letterSpacing: '-0.025em'
  };

  const textStyle = {
    fontSize: '14px',
    color: '#6B7280', // Medium gray
    maxWidth: '300px',
    lineHeight: '1.5',
    margin: '0 auto 32px auto'
  };

  const buttonStyle = {
    backgroundColor: '#1A1F36   ',
    color: '#FFFFFF',
    padding: '12px 32px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  return (
    <div style={containerStyle}>
      {/* Custom SVG Icon */}
      <div style={iconContainerStyle}>
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </div>

      <h3 style={headingStyle}>
        No Reels found in {categoryName || 'this group'}
      </h3>
      
      <p style={textStyle}>
        We couldn't find any videos for this selection. Try browsing all reels to find what you're looking for.
      </p>

      <button
        style={buttonStyle}
        onClick={onReset}
        onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#1A1F36'}
      >
        Browse All Reels
      </button>
    </div>
  );
};

export default EmptyReelsState;