"use client";

import React, { useRef } from 'react';
import { UploadArea } from './UploadArea';
import type { UploadItem, VideoUrlFetchResult, UploadStatus } from '@/types/types';
import { Spinner } from '@/components/shared/Spinner'; // Import Spinner for loading states

interface VideoUploadCardProps {
  item: UploadItem;
  onAddAudioClick: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onRemoveAudio: (id: string) => void;
  onAudioSelect: (id: string, file: File | null) => void;
}

// Helper function to format duration (seconds) into MM:SS or HH:MM:SS
function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || isNaN(seconds) || seconds < 0) {
    return '--:--';
  }
  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const secsStr = secs.toString().padStart(2, '0');
  const minsStr = minutes.toString().padStart(2, '0');
  
  if (hours > 0) {
      const hoursStr = hours.toString(); // No padding needed for hours
      return `${hoursStr}:${minsStr}:${secsStr}`;
  }
  return `${minsStr}:${secsStr}`;
}

// Helper function defined inside or imported (keep for audio size)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const VideoUploadCard: React.FC<VideoUploadCardProps> = ({
  item,
  onAddAudioClick,
  onRemoveItem,
  onRemoveAudio,
  onAudioSelect,
}) => {

  // Use properties directly from item
  const { 
    id, file, videoUrl, title, thumbnailUrl, duration, 
    audioFile, 
    status, progress, errorMessage,
    showAddAudioLink, wantsSeparateAudio // Added these UI states
  } = item;
  
  const audioDisplayName = audioFile?.name; 
  const audioDisplaySize = audioFile ? `(${formatFileSize(audioFile.size)})` : null; 
  
  // Ref for the hidden audio input
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Handler for the hidden audio input change (now calls prop)
  const handleHiddenAudioInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onAudioSelect(id, file);
    if (event.target) event.target.value = '';
  };

  // Determine if this specific item is actively processing
  const isActive = status !== 'idle' && status !== 'complete' && status !== 'error';

  // Capitalize status helper
  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  // --- Render Status/Progress UI --- 
  const renderStatusDisplay = () => {
    if (!isActive && status !== 'complete' && status !== 'error') return null; // Only show when not idle

    let statusText = capitalize(status);
    let icon = null;
    let showProgressPercent = false;
    let textColor = 'text-slate-400';

    switch (status) {
        case 'uploading':
        case 'processing':
        case 'enhancing':
            icon = <Spinner size="sm" color="text-primary" />; // Use spinner
            statusText = `${capitalize(status)}...`;
            showProgressPercent = true;
            textColor = 'text-primary';
            break;
        case 'complete':
            icon = <i className="ri-checkbox-circle-fill text-green-500"></i>;
            textColor = 'text-green-500';
            break;
        case 'error':
            icon = <i className="ri-error-warning-fill text-red-500"></i>;
            statusText = errorMessage || 'Error';
            textColor = 'text-red-500';
            break;
    }

    return (
        <div className={`flex items-center text-xs ${textColor} mt-2`}>
            <div className="w-4 h-4 mr-1.5 flex items-center justify-center">{icon}</div>
            <span className="flex-1 truncate" title={status === 'error' ? statusText : undefined}>{statusText}</span>
            {showProgressPercent && <span className="ml-2 whitespace-nowrap">{progress.toFixed(0)}%</span>}
        </div>
    );
  };

  return (
    <div className={`bg-slate-900/70 rounded-lg p-6 relative border shadow-md ${isActive ? 'border-primary/30' : 'border-slate-800'} transition-colors duration-300`}>
      {/* Remove Item Button - Hide if processing this item */}
       {!isActive && (
          <button 
            onClick={() => onRemoveItem(id)}
            className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-red-400 bg-slate-800/50 hover:bg-slate-700/80 rounded-full z-10"
            title="Remove this video item"
          >
              <i className="ri-close-line text-lg"></i>
          </button>
      )}

      {/* --- Container for Video and Linked Audio --- */}
      <div className="relative">
        
        {/* --- Video Source Display --- */} 
        <div className={`${isActive ? 'opacity-50' : ''}`}> {/* Dim content if processing */} 
            {!file && !videoUrl ? (
                <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
                    <p className="text-slate-400">No video selected</p>
                </div>
            ) : file ? (
                <div className="bg-slate-800 rounded p-3 flex items-center text-sm">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded mr-3 bg-slate-700 text-primary">
                        <i className="ri-film-line"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                </div>
            ) : videoUrl ? (
                <div className={`rounded overflow-hidden ${title === 'Fetch Failed' ? 'bg-red-900/30' : 'bg-slate-800'}`}> 
                    {thumbnailUrl && title !== 'Fetch Failed' && (
                        <img src={thumbnailUrl} alt="Video thumbnail" className="w-full h-20 object-cover opacity-80" /> 
                    )}
                    <div className="p-3 text-sm">
                        <div className="flex items-center">
                            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded mr-3 ${title === 'Fetch Failed' ? 'bg-red-700/20' : 'bg-slate-700'}`}> 
                                <i className={title === 'Fetch Failed' ? "ri-error-warning-line text-red-400" : "ri-youtube-fill text-red-500"}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${title === 'Fetch Failed' ? 'text-red-400' : 'text-white'}`}>
                                    {title || 'Video URL'}
                                </p>
                                <div className="flex items-center text-xs text-slate-400">
                                    <span className="truncate flex-1 mr-2">{videoUrl}</span> 
                                    {duration != null && title !== 'Fetch Failed' && (
                                    <span className="flex-shrink-0 whitespace-nowrap">
                                        <i className="ri-time-line mr-1"></i> 
                                        {formatDuration(duration)}
                                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
        {/* --- End Video Source Display --- */}

        {/* --- Status / Progress Bar (shown when active/complete/error) --- */} 
        {renderStatusDisplay()}
        {isActive && (
             <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                 <div 
                     className="h-full bg-primary rounded-full transition-all duration-200 ease-linear"
                     style={{ width: `${progress}%` }}
                 ></div>
             </div>
        )}

        {/* --- Audio Link / Selected Audio Info --- */} 
        {/* Show only if video source exists AND item is NOT active */}
        {(file || videoUrl) && !isActive && (
            <div className="relative pl-12 pt-3 mt-1"> 
                {/* Vertical Connector */} 
                 <div className={`absolute left-5 -top-2 w-px bg-slate-700 border-l border-dashed border-slate-600 ${audioFile ? 'bottom-0' : 'bottom-3'}`}></div>
                
                {showAddAudioLink && !audioFile ? (
                    <button 
                        onClick={() => onAddAudioClick(id)}
                        className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium"
                    >
                        <i className="ri-add-line mr-1"></i>
                        Add separate audio track
                    </button>
                ) : audioFile ? (
                   <div className="bg-slate-800 rounded p-3 flex items-center text-sm max-w-md">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded mr-3 bg-slate-700 text-secondary"> 
                          <i className="ri-file-music-line"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{audioDisplayName}</p>
                          {audioDisplaySize && <p className="text-xs text-slate-400">{audioDisplaySize}</p>}
                      </div>
                      <button 
                          className="p-2 ml-2 text-slate-400 hover:text-white flex-shrink-0"
                          onClick={() => onRemoveAudio(id)}
                          title="Remove audio file"
                      >
                          <i className="ri-close-line"></i>
                      </button>
                   </div>
                ) : null}
            </div>
        )}
      </div> 

      {/* Hidden input for audio file selection */} 
      <input
         type="file"
         id={`audioFile-${id}`} 
         ref={audioInputRef}
         className="hidden"
         accept="audio/mp3,audio/wav,audio/aac,audio/ogg,audio/flac"
         onChange={handleHiddenAudioInputChange}
         disabled={isActive}
       />

    </div>
  );
}; 