import React, { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outlined';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', startIcon, endIcon, fullWidth = false, className = '', disabled = false, type = 'button', ...props }, ref) => {
    // Base styles applied to all buttons
    const baseStyles =
      'py-3 inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    // Variant-specific styles
    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-gray-800 active:bg-blue-800 focus:ring-blue-500',
      secondary: 'bg-secondary text-gray-800 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500',
      outlined: 'bg-transparent text-primary-600 border border-gray-600 hover:bg-primary-light-50  focus:ring-primary-500',
    };

    // Size-specific styles
    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    };

    // Apply disabled styles if the button is disabled
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    // Apply full width style if fullWidth is true
    const widthStyle = fullWidth ? 'w-full' : '';

    // Combine all styles
    const buttonStyles = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${disabledStyles}
      ${widthStyle}
      ${className} cursor-pointer
    `;

    return (
      <button ref={ref} type={type} disabled={disabled} className={buttonStyles} {...props}>
        {startIcon && <span className="inline-flex">{startIcon}</span>}
        {children}
        {endIcon && <span className="inline-flex">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

import { ButtonHTMLAttributes, ReactNode } from 'react';
