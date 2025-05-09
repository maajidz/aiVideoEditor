'use client';

import React, { useState, useRef, useEffect } from 'react';

// --- SVG Icons for Aspect Ratios ---

const Icon16_9 = () => (
  <svg viewBox="0 0 32 18" width="24" height="13.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2 flex-shrink-0">
    <rect x="1" y="1" width="30" height="16" rx="1" />
  </svg>
);

const Icon9_16 = () => (
  <svg viewBox="0 0 18 32" width="13.5" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2 flex-shrink-0">
    <rect x="1" y="1" width="16" height="30" rx="1" />
  </svg>
);

// Add 1:1 icon
const Icon1_1 = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2 flex-shrink-0">
    <rect x="2" y="2" width="20" height="20" rx="1" />
  </svg>
);

// Add more icons as needed (e.g., 4:5)
const IconPlaceholder = () => (
   <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2 flex-shrink-0">
    <rect x="3" y="3" width="18" height="18" rx="1" />
  </svg>
);

// --- Helper to get Icon Component --- 

export const getAspectRatioIcon = (ratio: string): React.ComponentType => {
  switch (ratio) {
    case '16:9': return Icon16_9;
    case '9:16': return Icon9_16;
    case '1:1': return Icon1_1;
    // Add cases for other ratios
    default: return IconPlaceholder;
  }
};

// --- Dropdown Component --- 

interface AspectRatioOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AspectRatioDropdownProps {
  options: AspectRatioOption[];
  value: string; // The selected option ID (e.g., '16:9')
  onChange: (value: string) => void;
}

export const AspectRatioDropdown: React.FC<AspectRatioDropdownProps> = ({ 
  options,
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.id === value) || options[0]; // Fallback to first if value not found

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        className="w-full flex items-center justify-between bg-slate-700 text-sm text-slate-300 px-3 py-2 rounded border border-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          {selectedOption?.icon}
          {selectedOption?.label}
        </span>
        <i className={`ri-arrow-down-s-line transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute z-10 top-full left-0 mt-1 w-full bg-slate-700 border border-slate-600 rounded shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option.id}
              className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-slate-600 ${value === option.id ? 'bg-primary/20 text-primary' : 'text-slate-300'}`}
              onClick={() => handleSelect(option.id)}
            >
              {option.icon}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 