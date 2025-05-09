'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLayoutContext } from '@/app/context/LayoutContext';
import { useRouter } from 'next/navigation';
import { UploadStatus } from '@/types/types';

// Advanced status descriptions for AI video processing
const statusDescriptions: Record<UploadStatus, string> = {
  'idle': 'Waiting',
  'uploading': 'Uploading to cloud',
  'analyzing': 'Analyzing content',
  'transcribing': 'Transcribing audio',
  'merging': 'Merging audio & video',
  'processing': 'Neural processing',
  'enhancing': 'AI enhancement',
  'generating': 'Generating clips',
  'optimizing': 'Optimizing output',
  'complete': 'Processing complete',
  'error': 'Error occurred'
};

// Status color mapping
const statusColors: Record<UploadStatus, string> = {
  'uploading': 'bg-blue-500',
  'analyzing': 'bg-indigo-500',
  'transcribing': 'bg-cyan-500',
  'merging': 'bg-teal-500',
  'processing': 'bg-amber-500',
  'enhancing': 'bg-purple-500',
  'generating': 'bg-pink-500',
  'optimizing': 'bg-green-500',
  'complete': 'bg-emerald-500',
  'error': 'bg-rose-500',
  'idle': 'bg-gray-500'
};

// Status icon mapping
const statusIcons: Record<UploadStatus, string> = {
  'uploading': 'ri-upload-cloud-line',
  'analyzing': 'ri-brain-line',
  'transcribing': 'ri-text-wrap',
  'merging': 'ri-merge-cells-horizontal',
  'processing': 'ri-cpu-line',
  'enhancing': 'ri-magic-line',
  'generating': 'ri-movie-line',
  'optimizing': 'ri-settings-5-line',
  'complete': 'ri-check-line',
  'error': 'ri-error-warning-line',
  'idle': 'ri-time-line'
};

const BackgroundProcessingToast: React.FC = () => {
  const {
    isProcessingInBackground,
    backgroundItems,
    aggregateBackgroundProgress,
    clearBackgroundProcessing,
  } = useLayoutContext();
  const router = useRouter();

  // State to toggle between expanded and minimal view
  const [isExpanded, setIsExpanded] = useState(true);
  
  // State to track if this is the initial appearance for animation
  const [isInitialAppearance, setIsInitialAppearance] = useState(true);
  
  // State to track animation classes
  const [animationClass, setAnimationClass] = useState('');
  
  // Ref to track previous expanded state for animations
  const prevExpandedRef = useRef(isExpanded);

  // Navigate to dashboard when toast first appears
  useEffect(() => {
    if (isProcessingInBackground) {
      // No need to navigate if already on dashboard page
      // This would be handled by the upload page's handlePutInBackground
    }
  }, [isProcessingInBackground]);

  // Handle initial appearance and toggle animations
  useEffect(() => {
    if (isProcessingInBackground && isInitialAppearance) {
      // Set the initial pull-in animation class
      setAnimationClass('animate-slide-in-right');
      
      // Remove the class after animation completes
      const timer = setTimeout(() => {
        setAnimationClass('');
        setIsInitialAppearance(false);
      }, 500); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isProcessingInBackground, isInitialAppearance]);
  
  // Handle minimize/expand animations
  useEffect(() => {
    // Only apply if not the initial render and expanded state changed
    if (!isInitialAppearance && prevExpandedRef.current !== isExpanded) {
      setAnimationClass(isExpanded ? 'animate-expand' : 'animate-collapse');
      
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 300); // Animation duration
      
      // Update the ref
      prevExpandedRef.current = isExpanded;
      
      return () => clearTimeout(timer);
    }
  }, [isExpanded, isInitialAppearance]);

  if (!isProcessingInBackground) {
    return null; // Don't render if nothing is processing
  }

  const completedItems = backgroundItems.filter(item => item.status === 'complete').length;
  const totalItems = backgroundItems.length;
  const isComplete = completedItems === totalItems;
  
  // Calculate an overall status text
  const getStatusText = () => {
    if (isComplete) return statusDescriptions.complete;
    
    // Get the "most important" current status
    const statusPriority: UploadStatus[] = [
      'error',
      'generating', 
      'enhancing', 
      'optimizing',
      'processing', 
      'merging',
      'transcribing',
      'analyzing',
      'uploading',
      'idle'
    ];
    
    // Find the highest priority status that any item has
    for (const status of statusPriority) {
      if (backgroundItems.some(item => item.status === status)) {
        return statusDescriptions[status];
      }
    }
    
    return statusDescriptions.processing;
  };
  
  // Get the overall status color
  const getStatusColor = () => {
    if (isComplete) return statusColors.complete;
    
    if (backgroundItems.some(item => item.status === 'error')) {
      return statusColors.error;
    }
    
    // Same priority list as getStatusText
    const statusPriority: UploadStatus[] = [
      'generating', 
      'enhancing', 
      'optimizing',
      'processing', 
      'merging',
      'transcribing',
      'analyzing',
      'uploading',
      'idle'
    ];
    
    for (const status of statusPriority) {
      if (backgroundItems.some(item => item.status === status)) {
        return statusColors[status];
      }
    }
    
    return statusColors.processing;
  };

  // Get icon for a status
  const getStatusIcon = (status: UploadStatus): string => {
    return statusIcons[status] || 'ri-loader-4-line';
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 bg-background border border-border rounded-lg shadow-lg z-50 text-foreground transition-transform duration-300 ease-in-out
      ${isExpanded ? 'w-80 max-h-80' : 'max-h-16 w-auto'} ${animationClass}`}
    >
      {/* Header - Always visible */}
      <div className={`flex items-center justify-between p-3 ${!isExpanded ? 'border-b-0' : 'border-b border-border'}`}>
        <div className="flex items-center space-x-2">
          {isComplete ? (
            <i className="ri-check-circle-line text-success-foreground" />
          ) : (
            <i className={`${getStatusIcon(backgroundItems[0]?.status || 'processing')} ${backgroundItems[0]?.status !== 'complete' ? 'animate-spin' : ''} text-primary-foreground`} />
          )}
          
          <span className="text-sm font-medium whitespace-nowrap">
            {isExpanded 
                ? `${getStatusText()} (${completedItems}/${totalItems})` 
                : `${getStatusText()} ${Math.round(aggregateBackgroundProgress)}%`
            }
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
           <button 
             className="h-6 w-6 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-slate-700 transition-all duration-200"
             onClick={() => setIsExpanded(!isExpanded)} 
             aria-label={isExpanded ? "Minimize" : "Expand"} 
           >
             <i className={`text-sm ${isExpanded ? "ri-subtract-line" : "ri-add-line"} transition-transform duration-200 ${animationClass ? 'rotate-180' : ''}`}></i>
           </button>
           
           <button 
             className="h-6 w-6 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-slate-700 transition-colors duration-200"
             onClick={clearBackgroundProcessing} 
             aria-label="Close" 
           >
             <i className="ri-close-line text-sm"></i>
           </button>
        </div>
      </div>

      {/* Body (Expanded View) */}
      {isExpanded && (
        <div className="p-3 space-y-3 overflow-y-auto max-h-60">
          {/* Aggregate Progress */}
          <div className="flex items-center space-x-2">
             <span className="text-xs w-16">Overall:</span>
             <div className="h-2 flex-grow bg-slate-700 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full transition-all duration-300 ease-linear ${getStatusColor()}`}
                 style={{ width: `${aggregateBackgroundProgress}%` }}
               ></div>
             </div>
             <span className="text-xs w-8 text-right">{Math.round(aggregateBackgroundProgress)}%</span>
          </div>

          {/* Individual items list */}
          <div className="text-xs space-y-2 max-h-40 overflow-y-auto pr-1">
            {backgroundItems.map((item, index) => (
              <div key={item.id} className={`space-y-1 transition-all duration-300 ease-in-out ${index > 0 ? 'animate-fade-in delay-' + (index * 100) : ''}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 truncate">
                    <i className={`${getStatusIcon(item.status)} ${item.status !== 'complete' && item.status !== 'error' ? 'animate-pulse' : ''} text-xs`}></i>
                    <span className="truncate font-medium" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs whitespace-nowrap font-medium">
                    {item.status === 'complete' 
                      ? <i className="ri-check-line text-success-foreground"></i> 
                      : item.status === 'error'
                        ? <i className="ri-error-warning-line text-error-foreground"></i>
                        : `${Math.round(item.progress)}%`
                    }
                  </span>
                </div>
                
                {item.status !== 'complete' && item.status !== 'error' && (
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ease-linear ${statusColors[item.status]}`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{statusDescriptions[item.status]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundProcessingToast; 