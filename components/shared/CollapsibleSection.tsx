"use client";

import React, { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  initialOpen?: boolean;
  optional?: boolean;
  // Optional: Add props for preview content when collapsed if needed
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  initialOpen = false,
  optional = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="bg-slate-900 rounded p-6 mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          {optional && (
             <div className="ml-3 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">Optional Override</div>
          )}
        </div>
        <div className="flex items-center text-slate-400">
          {/* Optional: Add preview content here if needed */}
          {/* <span className="text-sm mr-2">Preview if collapsed</span> */}
          <i
            className={`ri-arrow-down-s-line transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          </i>
        </div>
      </button>
      {/* Content Area */}
      {isOpen && (
        <div className="mt-6 border-t border-slate-800 pt-6">
          {children}
        </div>
      )}
    </div>
  );
}; 