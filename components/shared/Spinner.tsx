import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'; // Optional size prop
  color?: string; // Optional color class (e.g., text-primary)
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'text-white' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-transparent border-t-current ${sizeClasses[size]} ${color}`}>
       {/* Using border-t-current makes it inherit the text color */}
       <span className="sr-only">Loading...</span>
    </div>
  );
}; 