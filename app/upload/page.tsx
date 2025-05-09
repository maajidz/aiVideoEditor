"use client"; // Needs state for file handling

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
// Sidebar import should be removed
import { ProgressTracker } from '@/components/upload/ProgressTracker';
import { UploadArea } from '@/components/upload/UploadArea';
import { UrlImport } from '@/components/upload/UrlImport';
import { VideoDetailsSection } from '@/components/upload/VideoDetailsSection';
import { PlatformSelection } from '@/components/upload/PlatformSelection';
import { AIEnhancementSettings } from '@/components/upload/AIEnhancementSettings';
import { useLayoutContext } from '@/app/context/LayoutContext'; // Import layout context
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs
// Import the new components
import { VideoUploadCard } from '@/components/upload/VideoUploadCard';
import { AddNextVideo } from '@/components/upload/AddNextVideo';
import { useRouter } from 'next/navigation'; // Import useRouter
import { RuxButton, RuxIcon, RuxProgress } from '@astrouxds/react';
import Footer from '@/components/shared/Footer';
import { UploadItem, Platform, BackgroundUploadItem, UploadStatus, VideoUrlFetchResult } from '@/types/types'; // Import Platform and BackgroundUploadItem

export default function UploadPage() {
  const router = useRouter(); // Initialize useRouter
  const { startBackgroundProcessing } = useLayoutContext(); // Get context function
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [allDetailsFilled, setAllDetailsFilled] = useState<boolean>(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]); // State for selected platforms
  
  // Use a ref to manage the interval timer
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { isSidebarCollapsed } = useLayoutContext();
  
  // --- Define stopSimulation FIRST --- 
  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Simulation stopped.');
    }
  }, []);

  // Helper to create a new empty item
  const createNewUploadItem = (): UploadItem => ({
    id: uuidv4(),
    file: null,
    audioFile: null,
    videoUrl: null,
    audioUrl: null,
    title: '',
    description: '',
    thumbnailUrl: null,
    duration: null, 
    status: 'idle',
    progress: 0,
    errorMessage: null,
    showAddAudioLink: false,
    wantsSeparateAudio: false,
  });

  // Handler to add the first empty item if the list is empty
  // (We'll trigger this on mount or when the first file is added)
  useEffect(() => {
    if (uploadItems.length === 0) {
      // Optionally start with one empty item
      // setUploadItems([createNewUploadItem()]); 
      // Or wait until the user adds the first file
    }
  }, [uploadItems]); // Run only when uploadItems changes length

  // --- Modified Handlers (Accept ID) --- 
  
  const updateUploadItem = (id: string, updates: Partial<UploadItem>) => {
    setUploadItems(currentItems => 
        currentItems.map(item => 
            item.id === id ? { ...item, ...updates } : item
        )
    );
  };

  // Helper to reset audio state for a specific item
  const resetAudioStateForItem = (id: string) => {
     updateUploadItem(id, {
        audioFile: null,
        audioUrl: null,
        wantsSeparateAudio: false,
        showAddAudioLink: true, 
    });
  };

  // Helper to reset video state 
  const resetVideoStateForItem = (id: string) => {
      updateUploadItem(id, {
          file: null,
          videoUrl: null,
          title: '',
          thumbnailUrl: null,
          duration: null, 
          status: 'idle',
          progress: 0,
          errorMessage: null,
          showAddAudioLink: false, 
      });
      resetAudioStateForItem(id);
  };

  const handleVideoSelect = (id: string, selectedFile: File | null) => {
    resetAudioStateForItem(id); 
    // TODO: Could try to get duration from file using <video> element if needed
    updateUploadItem(id, {
        file: selectedFile,
        videoUrl: null,
        title: '',
        thumbnailUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
        duration: null, // Clear duration for file uploads for now
        showAddAudioLink: !!selectedFile, 
    });
    console.log(`Video file selected for item ${id}:`, selectedFile?.name);
  };

  const handleAudioSelect = (id: string, selectedAudioFile: File | null) => {
     if (selectedAudioFile) {
         // Update only the file/URL state. wantsSeparateAudio is already true.
         updateUploadItem(id, {
            audioFile: selectedAudioFile,
            audioUrl: null, 
        });
        console.log(`Audio file selected for item ${id}:`, selectedAudioFile?.name);
     } else {
         updateUploadItem(id, { audioFile: null }); 
         console.log(`Audio file selection cancelled for item ${id}`);
         // OPTIONAL: Should we set wantsSeparateAudio back to false if they cancel?
         // updateUploadItem(id, { wantsSeparateAudio: false, showAddAudioLink: true }); 
     }
  };
  
  // Modified fetch handler for existing items
  const handleVideoUrlFetch = async (id: string, url: string): Promise<VideoUrlFetchResult> => {
    resetAudioStateForItem(id);
    console.log(`Calling backend for item ${id}, URL: ${url}`);
    
    updateUploadItem(id, { 
        videoUrl: url,
        title: 'Fetching metadata...', 
        thumbnailUrl: null,
        duration: null,
        showAddAudioLink: false, 
    });

    try {
        const response = await fetch(`/api/youtube-metadata?url=${encodeURIComponent(url)}`);
        const data: VideoUrlFetchResult = await response.json();

        if (!response.ok || !data.success) {
            console.error("Backend fetch error:", data.error || response.statusText);
            throw new Error(data.error || 'Failed to fetch metadata');
        }

        updateUploadItem(id, {
            videoUrl: url,
            file: null,
            title: data.title || 'Title not found',
            thumbnailUrl: data.thumbnailUrl, 
            duration: data.duration ?? null, // Use nullish coalescing for undefined
            showAddAudioLink: true, 
        });
        return { success: true, title: data.title, thumbnailUrl: data.thumbnailUrl, duration: data.duration };

    } catch (error: any) {
        console.error("Error calling backend metadata endpoint:", error);
        // Update item with error state
        updateUploadItem(id, { 
            videoUrl: url, 
            title: 'Fetch Failed',
            thumbnailUrl: null,
            duration: null,
            showAddAudioLink: false,
            status: 'error', // Also set status to error
            errorMessage: error.message
         }); 
        return { success: false, error: error.message };
    }
  };

  const handleAudioUrlFetch = async (id: string, url: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const success = Math.random() > 0.3;
    if (success) {
         // Update only the file/URL state. wantsSeparateAudio is already true.
        updateUploadItem(id, {
            audioUrl: url,
            audioFile: null,
        });
    } else {
       updateUploadItem(id, { audioUrl: null }); 
       // OPTIONAL: Should we set wantsSeparateAudio back to false if fetch fails?
       // updateUploadItem(id, { wantsSeparateAudio: false, showAddAudioLink: true }); 
    }
    return success;
  };

  const handleAddAudioClick = (id: string) => {
    // Set wantsSeparateAudio to true immediately to render the audio section
    // Also hide the link
    updateUploadItem(id, { 
        wantsSeparateAudio: true, 
        showAddAudioLink: false 
    });
    
    // Trigger click AFTER the re-render ensures the input exists
    setTimeout(() => {
        const audioElement = document.getElementById(`audioFile-${id}`); 
        if (!audioElement) {
            console.error(`Could not find audio input element with ID: audioFile-${id}`);
            return; 
        }
        audioElement.click();
    }, 0);
  };
  
  // Updated remove handler to reset video state
  const handleRemoveItem = (id: string) => {
      // Optionally, fade out animation before removing
      setUploadItems(currentItems => currentItems.filter(item => item.id !== id));
      console.log(`Removed item ${id}`);
      // No need to call resetVideoStateForItem here, as the item is gone
  };
  
  const handleRemoveAudio = (id: string) => {
       updateUploadItem(id, {
           audioFile: null,
           audioUrl: null,
           wantsSeparateAudio: false, 
           showAddAudioLink: true, 
       });
       console.log(`Audio removed for item ${id}`);
  };
  
  const handleAddNewVideo = (selectedFile?: File | null, url?: string | null, metadata?: { title?: string, thumbnailUrl?: string | null, duration?: number | null }) => {
    const newItem = createNewUploadItem();
    if (selectedFile) {
        newItem.file = selectedFile;
        newItem.thumbnailUrl = URL.createObjectURL(selectedFile);
        newItem.showAddAudioLink = true;
    } else if (url) {
        newItem.videoUrl = url; 
        newItem.title = metadata?.title || `Video from ${new URL(url).hostname}`;
        newItem.thumbnailUrl = metadata?.thumbnailUrl || null;
        newItem.duration = metadata?.duration ?? null; // Use nullish coalescing
        newItem.showAddAudioLink = true;
    } 
    setUploadItems(currentItems => [...currentItems, newItem]);
};

  const handleInitialVideoUrlFetch = async (url: string): Promise<VideoUrlFetchResult> => {
      console.log("Calling backend for initial video URL:", url);

      try {
          const response = await fetch(`/api/youtube-metadata?url=${encodeURIComponent(url)}`);
          const data: VideoUrlFetchResult = await response.json();

          if (!response.ok || !data.success) {
              console.error("Backend fetch error:", data.error || response.statusText);
              throw new Error(data.error || 'Failed to fetch metadata');
          }
          
          console.log("Initial URL fetch success:", true);
          return { 
              success: true, 
              title: data.title, 
              thumbnailUrl: data.thumbnailUrl, 
              duration: data.duration ?? null // Use nullish coalescing
            };

      } catch (error: any) {
          console.error("Error calling backend metadata endpoint:", error);
          console.log("Initial URL fetch failed");
          return { success: false, error: error.message };
      }
  };

  // --- Define simulateProgress AFTER stopSimulation --- 
  const simulateProgress = useCallback(() => {
    setUploadItems(prevItems => {
      
      // Calculate the next state for all items first
      const nextStateItems = prevItems.map(item => {
        let currentStatus = item.status;
        let currentProgress = item.progress;
        let nextStatus: UploadStatus = currentStatus;
        let nextProgress: number = currentProgress;

        // Only update items that are in active processing states
        if (['uploading', 'processing', 'enhancing'].includes(currentStatus)) {
            nextProgress = currentProgress + Math.random() * 15;

            if (nextProgress >= 100) {
              nextProgress = 100;
              if (currentStatus === 'uploading') {
                nextStatus = 'processing';
                nextProgress = 0;
              } else if (currentStatus === 'processing') {
                nextStatus = 'enhancing';
                nextProgress = 0;
              } else if (currentStatus === 'enhancing') {
                // Use type assertion to assign 'complete'
                nextStatus = 'complete' as UploadStatus;
                nextProgress = 100;
              }
            } else {
              nextProgress = Math.min(nextProgress, 100);
            }
        }
        // Return the original item structure with potentially updated status/progress
        return { ...item, status: nextStatus, progress: nextProgress };
      });

      // Check if any item in the *next* state is still processing
      const anyItemStillProcessing = nextStateItems.some(item => 
        ['uploading', 'processing', 'enhancing'].includes(item.status)
      );

      // Stop the simulation if no items will be processing in the next state
      if (!anyItemStillProcessing && intervalRef.current) {
        console.log('No more active items in next state, stopping simulation.');
        stopSimulation();
      }

      // Return the calculated next state
      return nextStateItems;
    });
  }, [stopSimulation]);

  // --- useEffect for cleanup --- 
  useEffect(() => {
    return () => {
      stopSimulation();
    };
  }, [stopSimulation]);

  const handleStartUpload = () => {
    const itemsToUpload = uploadItems.filter(item => (item.file || item.videoUrl) && item.status === 'idle');
    if (itemsToUpload.length === 0) {
      alert("Add videos or wait for current processing to finish.");
      return;
    }

    // Prevent starting multiple intervals
    if (intervalRef.current) { // Check intervalRef directly instead of isProcessingActive state
        console.log("Processing already active (interval running).");
        return;
    }

    console.log(`Starting simulation for ${itemsToUpload.length} items...`);
    // isProcessingActive will be implicitly true when intervalRef is not null

    // Set initial status for items being processed now
    setUploadItems(currentItems => 
        currentItems.map(item => 
            itemsToUpload.some(toUpload => toUpload.id === item.id)
                ? { ...item, status: 'uploading', progress: 0, errorMessage: null }
                : item
        )
    );

    // Instead, just start the main simulation interval
    if (!intervalRef.current) { // Check again to be safe
       intervalRef.current = setInterval(simulateProgress, 500); // Use the main simulateProgress function (adjust interval if needed)
    }

    // Find the first item that isn't complete or errored to start the simulation from
    const firstActiveItemIndex = uploadItems.findIndex(item => item.status !== 'complete' && item.status !== 'error');

    if (firstActiveItemIndex === -1) {
        console.log("All items already processed or in error state.");
        // Potentially reset statuses if re-uploading, or handle as needed
        return;
    }

    // Update all items to 'queued' or their first processing step if not already started
    const itemsToProcess = uploadItems.map(item => ({
        ...item,
        status: (item.status === 'idle' || item.status === 'error') ? 'uploading' : item.status,
        progress: (item.status === 'idle' || item.status === 'error') ? 0 : item.progress,
    }));
    setUploadItems(itemsToProcess);

    // Clear any existing interval before starting a new one
    stopSimulation(); 
    // Start the simulation
    intervalRef.current = setInterval(() => simulateProgress(), 1000); 
  };

  const handlePutInBackground = () => {
    console.log("Putting in background...");
    const backgroundProcessingItems: BackgroundUploadItem[] = uploadItems
      .filter(item => item.status !== 'complete' && item.status !== 'error') // Only process items not already done/failed
      .map(item => ({
        id: item.id,
        name: item.title || item.file?.name || 'Untitled Project',
        status: item.status === 'idle' ? 'uploading' : item.status, // Start from uploading if idle
        progress: item.status === 'idle' ? 0 : item.progress,
      }));

    if (backgroundProcessingItems.length > 0) {
      startBackgroundProcessing(backgroundProcessingItems);
      // Navigate to projects page instead of dashboard
      router.push('/projects'); 
    } else {
      // If all items are complete/error, maybe just go to dashboard or projects list without starting background task
      alert("All items are already processed or in an error state.");
      router.push('/projects'); // Or stay, or go to dashboard, depends on desired UX
    }
    // Clear local upload items as they are now handled by context
    // setUploadItems([]); // Optional: Clear local state if you want to prevent re-upload from this page
  };

  // --- Calculations --- 
  const aggregateProgress = uploadItems.length > 0
      ? uploadItems.reduce((acc, item) => {
            const progress = item.status === 'complete' ? 100 : item.progress;
            return acc + progress;
        }, 0) / uploadItems.length
      : 0;

  // Check if *any* item is in an active processing state
  const isProcessing = uploadItems.some(item => ['uploading', 'processing', 'enhancing'].includes(item.status));
  // Check if *all* items are finished (completed, errored, or idle) and none are processing
  const allTasksFinished = uploadItems.length > 0 && !isProcessing && uploadItems.every(item => ['complete', 'error', 'idle'].includes(item.status));

  const showInitialUpload = uploadItems.length === 0;

  const footerLeftOffset = isSidebarCollapsed ? 'left-20' : 'left-64';
  const isAnyVideoSelected = uploadItems.some(item => item.file || item.videoUrl);

  // --- Render Logic --- 
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="Upload New Video" />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24 overflow-y-auto">
        {/* Show Aggregate Progress Bar if processing is active */}
        {isProcessing && (
          <div className="my-6 p-4 bg-slate-800 rounded">
             <div className="flex items-center text-primary mb-2">
               <div className="mr-2"><i className="ri-loader-4-line animate-spin"></i></div>
               <span className="font-medium">Processing Batch...</span>
             </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-200 ease-linear"
                style={{ width: `${aggregateProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">Overall Progress: {aggregateProgress.toFixed(2)}%</p>
          </div>
        )}

        <div className="space-y-8 mb-8">
           {uploadItems.map((item) => (
                <VideoUploadCard 
                    key={item.id}
                    item={item}
                    onRemoveItem={handleRemoveItem}
                    onRemoveAudio={() => handleRemoveAudio(item.id)}
                    onAddAudioClick={() => handleAddAudioClick(item.id)}
                    onAudioSelect={handleAudioSelect} 
                 />
           ))}
        </div>

         {!isProcessing && (
             <AddNextVideo
                onVideoAdded={handleAddNewVideo as any}
                onVideoUrlFetch={handleInitialVideoUrlFetch}
                isFirstItem={uploadItems.length === 0}
              />
        )}

        {!isProcessing && isAnyVideoSelected && (
           <>
             <h3 className="text-lg font-medium text-white mt-8 mb-4 pt-6 border-t border-slate-800">Output Settings</h3>
             <VideoDetailsSection />
             <PlatformSelection />
             <AIEnhancementSettings />
           </>
        )}
      </main>
      
      <Footer>
          <div className="flex justify-between items-center w-full">
              <div className="flex-grow mr-4">
                  {!allTasksFinished && uploadItems.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                          {uploadItems.length} video(s) ready. Fill in details and select platforms.
                      </span>
                  )}
                  {allTasksFinished && (
                      <span className="text-sm text-success-foreground">
                          Processing Complete for {uploadItems.length} video(s).
                      </span>
                  )}
                  {!uploadItems.length && !allTasksFinished && (
                      <span className="text-sm text-muted-foreground">&nbsp;</span> // Non-breaking space
                  )}
              </div>

              <div className="flex space-x-2 flex-shrink-0">
                  {isProcessing && (
                      <button
                          type="button"
                          onClick={handlePutInBackground}
                          className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-button text-sm whitespace-nowrap"
                      >
                          <i className="ri-eye-off-line mr-2"></i>
                          <span>Put in Background</span>
                      </button>
                  )}
                  <button
                      type="button" 
                      onClick={handleStartUpload}
                      disabled={uploadItems.length === 0 || isProcessing || !uploadItems.some(item => ['idle', 'error'].includes(item.status))}
                      className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-button text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isProcessing ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-play-circle-line mr-2"></i>
                          <span>{uploadItems.some(item => ['idle', 'error'].includes(item.status)) ? 'Process Video' : 'Processing Complete'}</span>
                        </>
                      )}
                  </button>
              </div>
          </div>
      </Footer>
    </div>
  );
} 