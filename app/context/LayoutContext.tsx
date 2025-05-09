'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { UploadStatus } from '@/types/types'; // Import the full UploadStatus

// Use UploadStatus for BackgroundUploadItem as well for consistency
export interface BackgroundUploadItem {
  id: string;
  name: string; 
  status: UploadStatus; // Use the detailed UploadStatus
  progress: number; 
}

interface LayoutContextProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isProcessingInBackground: boolean;
  backgroundItems: BackgroundUploadItem[];
  aggregateBackgroundProgress: number;
  startBackgroundProcessing: (items: BackgroundUploadItem[]) => void;
  clearBackgroundProcessing: () => void;
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

// Define the sequence of statuses for simulation (excluding 'complete' and 'idle')
const activeProcessingSequence: Exclude<UploadStatus, 'complete' | 'idle' | 'error'>[] = [
  'uploading',
  'analyzing',
  'transcribing',
  'merging',
  'processing',
  'enhancing',
  'generating',
  'optimizing',
];

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isProcessingInBackground, setIsProcessingInBackground] = useState(false);
  const [backgroundItems, setBackgroundItems] = useState<BackgroundUploadItem[]>([]);
  const [aggregateBackgroundProgress, setAggregateBackgroundProgress] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Context: Simulation stopped.');
    }
  };

  const simulateProgress = () => {
    setBackgroundItems(prevItems => {
      let allItemsEffectivelyComplete = true;
      const updatedItems = prevItems.map(item => {
        if (item.status === 'complete' || item.status === 'error') {
          return item;
        }
        allItemsEffectivelyComplete = false;
        
        let newProgress = item.progress + Math.random() * 20 + 15; 
        let newStatus: UploadStatus = item.status;

        if (newProgress >= 100) {
          newProgress = 0; 
          const currentIndex = activeProcessingSequence.indexOf(item.status as Exclude<UploadStatus, 'complete' | 'idle' | 'error'>);
          
          if (currentIndex !== -1 && currentIndex < activeProcessingSequence.length - 1) {
            newStatus = activeProcessingSequence[currentIndex + 1];
          } else {
            newStatus = 'complete'; 
            newProgress = 100;
          }
        } else {
           newProgress = Math.min(newProgress, 100);
        }
        
        return { ...item, status: newStatus, progress: newProgress };
      });

      // Calculate true aggregate progress towards final completion
      const totalOverallProgress = updatedItems.reduce((acc, currentItem) => {
        if (currentItem.status === 'complete') {
          return acc + 100;
        }
        if (currentItem.status === 'error') {
          // Errored items don't contribute to positive progress, or you might count them as 0
          return acc; 
        }

        // Calculate how far along the item is in the total sequence
        const currentStageIndex = activeProcessingSequence.indexOf(currentItem.status as Exclude<UploadStatus, 'complete' | 'idle' | 'error'>);
        let itemOverallProgress = 0;
        if (currentStageIndex !== -1) {
          // Progress from completed stages
          itemOverallProgress = (currentStageIndex / activeProcessingSequence.length) * 100;
          // Add progress within the current stage, scaled by its proportion of the total sequence
          itemOverallProgress += (currentItem.progress / 100) * (1 / activeProcessingSequence.length) * 100;
        }
        return acc + Math.min(itemOverallProgress, 100); // Cap at 100
      }, 0);
      
      setAggregateBackgroundProgress(updatedItems.length > 0 ? totalOverallProgress / updatedItems.length : 0);

      if (allItemsEffectivelyComplete) {
        console.log('Context: All items complete or errored, stopping simulation.');
        stopSimulation();
      }
      return updatedItems;
    });
  };

  const startBackgroundProcessing = (initialItems: BackgroundUploadItem[]) => {
    console.log('Context: Starting background processing for', initialItems);
    const preparedItems = initialItems.map(item => ({
        ...item,
        status: item.status === 'idle' ? activeProcessingSequence[0] : item.status,
        progress: item.status === 'idle' ? 0 : item.progress, 
    }));

    setBackgroundItems(preparedItems);
    setAggregateBackgroundProgress(0);
    setIsProcessingInBackground(true);
    
    stopSimulation(); 
    intervalRef.current = setInterval(simulateProgress, 1500); 
  };

  const clearBackgroundProcessing = () => {
    console.log('Context: Clearing background processing state.');
    stopSimulation();
    setIsProcessingInBackground(false);
    setBackgroundItems([]);
    setAggregateBackgroundProgress(0);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      stopSimulation();
    };
  }, []);

  return (
    <LayoutContext.Provider 
      value={{
          isSidebarCollapsed, 
          toggleSidebar,
          isProcessingInBackground,
          backgroundItems,
          aggregateBackgroundProgress,
          startBackgroundProcessing,
          clearBackgroundProcessing
        }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
}; 