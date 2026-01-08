import './Button.css'; // Styles defined below

const Button = ({ 
  children,           // The content inside (Text, Icons, etc.)
  onClick,            // The function to run on click
  variant = 'primary', // Style variant: 'primary', 'secondary', 'danger', 'outline'
  className = '',     // Allow adding extra classes if needed
  disabled = false,   // Handle disabled state
  type = 'button',    // Default to button, can be 'submit' or 'reset'
  ...props            // Capture any other props (id, aria-label, style, etc.)
}) => {
  
  // Combine the base class, variant class, and any custom classes
  const buttonClass = `btn btn-${variant} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props} // Spreads remaining props to the DOM element
    >
      {children}
    </button>
  );
};

export default Button;