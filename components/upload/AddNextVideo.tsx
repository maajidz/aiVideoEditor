"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Spinner } from '@/components/shared/Spinner'; // Import Spinner
import type { VideoUrlFetchResult } from '@/types/types';

interface AddNextVideoProps {
  onVideoAdded: (file?: File | null, url?: string | null, metadata?: { title?: string, thumbnailUrl?: string | null, duration?: number | null }) => void;
  onVideoUrlFetch: (url: string) => Promise<VideoUrlFetchResult>;
  isFirstItem: boolean; // Prop to control text
}

export const AddNextVideo: React.FC<AddNextVideoProps> = ({
  onVideoAdded,
  onVideoUrlFetch,
  isFirstItem
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = `add-next-video-${React.useId()}`; // Unique ID for the label

  // State for URL input
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlSuccess, setUrlSuccess] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      onVideoAdded(file, null); // Pass file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow drop
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0] || null;
      if (file) {
        // Optional: Add validation for file type and size here
        onVideoAdded(file, null); // Pass file
      }
    },
    [onVideoAdded]
  );

  const handleUrlFetchClick = async () => {
    if (!urlInput) return;
    setIsLoadingUrl(true);
    setUrlError(null);
    setUrlSuccess(false);
    const result = await onVideoUrlFetch(urlInput);
    setIsLoadingUrl(false);
    if (result.success) {
      setUrlSuccess(true);
      // Pass metadata back to parent when calling onVideoAdded
      onVideoAdded(null, urlInput, { 
          title: result.title, 
          thumbnailUrl: result.thumbnailUrl, 
          duration: result.duration 
      }); 
      setUrlInput(''); // Clear input
       // Optionally hide success message after delay
      setTimeout(() => setUrlSuccess(false), 3000); 
    } else {
      setUrlError(result.error || 'Failed to fetch video from URL. Please check the link.'); // Use error from result
      // Optionally hide error message after delay
      setTimeout(() => setUrlError(null), 5000);
    }
  };

  // Determine dynamic text
  const titleText = isFirstItem ? "Add Video" : "Add Another Video";
  const subtitleText = isFirstItem ? "Drag & drop, browse files, or import URL" : "Drag & drop or browse files"; // Simpler for subsequent adds

  return (
     <div 
      className={`add-video-area rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border-2 border-dashed p-6 
        ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-700 hover:border-slate-600'}
         transition-all duration-200 cursor-pointer`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()} // Click anywhere to open file browser
     >
        <div className="flex flex-col items-center justify-center text-center">
           <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 group-hover:bg-slate-600/50 rounded-full mb-3 text-slate-400">
               <i className={`ri-${isFirstItem ? 'video-upload' : 'video-add'}-line text-xl`}></i>
           </div>
           <p className="text-sm font-medium text-slate-300 mb-1">{titleText}</p>
           <p className="text-xs text-slate-400">{subtitleText}</p>
             {/* Hidden file input */}
            <input
                type="file"
                id={inputId}
                ref={fileInputRef}
                className="hidden"
                accept="video/mp4,video/mov,video/avi" // Match video formats
                onChange={handleFileChange}
            />
           {/* TODO: Add URL import trigger/modal later */}
         </div>

         {/* --- URL Import Section (Only show for the first item) --- */}
         {isFirstItem && (
             <div 
                 className="mt-4 pt-4 border-t border-slate-700/50"
                 onClick={(e) => e.stopPropagation()} // Prevent click bubbling to outer div
             >
                 <label htmlFor={`urlInput-${inputId}`} className="block text-sm font-medium text-slate-300 mb-1">
                     Or Import Video from URL
                 </label>
                 <div className="flex">
                     <input 
                         type="url" 
                         id={`urlInput-${inputId}`}
                         value={urlInput}
                         onChange={(e) => setUrlInput(e.target.value)}
                         placeholder="https://..."
                         className="flex-grow bg-slate-700 text-sm text-slate-300 px-3 py-2 rounded-l border border-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50"
                         disabled={isLoadingUrl}
                     />
                     <button 
                         onClick={handleUrlFetchClick}
                         disabled={isLoadingUrl || !urlInput}
                         className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-r flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                     >
                         {isLoadingUrl ? <Spinner size="sm" /> : 'Fetch Video'}
                     </button>
                 </div>
                 {urlError && <p className="text-xs text-red-400 mt-1">{urlError}</p>}
                 {urlSuccess && <p className="text-xs text-green-400 mt-1">Video added successfully!</p>}
             </div>
         )}
     </div>
  );
}; 