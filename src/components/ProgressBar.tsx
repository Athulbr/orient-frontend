import React from 'react';

interface ProgressBarProps {
  value: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  size = 'medium',
  color = 'primary'
}) => {
  const sizeClasses = {
    small: 'h-1.5',
    medium: 'h-2',
    large: 'h-3'
  };

  const colorClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  const progressColor = colorClasses[color];
  const progressHeight = sizeClasses[size];

  return (
    <div className={`w-full ${progressHeight} rounded-full bg-gray-200 overflow-hidden ${className}`}>
      <div
        className={`h-full ${progressColor} transition-all duration-300 ease-in-out rounded-full`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default ProgressBar;
