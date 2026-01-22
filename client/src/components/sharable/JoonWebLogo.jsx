import React from 'react';

const JoonWebLogo = ({ 
  width = "160px", 
  height = "90px", 
  className = "", 
  style = {} 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 160 60"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ padding: '5px', ...style }}
    >
      <g>
        
        <text 
          x="0" 
          y="34" 
          fontFamily="'Segoe UI', Roboto, sans-serif" 
          fontWeight="800" 
          fontSize="24" 
          fill="#F1F5F9" // Off-White
          letterSpacing="-0.5"
        >
          SHOPPABLE
        </text>

        {/* Sub Heading: REELS & VIDEOS */}
        <text 
          x="1" 
          y="49" 
          fontFamily="'Segoe UI', Roboto, sans-serif" 
          fontWeight="600" 
          fontSize="10" 
          fill="#CBD5E1"
          letterSpacing="2.5" 
          style={{ textTransform: 'uppercase' }}
        >
          REELS & VIDEOS
        </text>
      </g>
    </svg>
  );
};

export default JoonWebLogo;