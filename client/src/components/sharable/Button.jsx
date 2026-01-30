import './Button.css';

const Button = ({ 
  children,           
  onClick,           
  variant = 'primary', 
  className = '',   
  disabled = false, 
  type = 'button', 
  ...props      
}) => {
  
  const buttonClass = `btn btn-${variant} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;