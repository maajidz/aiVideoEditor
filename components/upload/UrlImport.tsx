"use client";

import React, { useState } from 'react';
import { Spinner } from '../shared/Spinner';

interface UrlImportProps {
  onVideoUrlFetch: (url: string) => Promise<boolean>; // Return true on success
  onAudioUrlFetch: (url: string) => Promise<boolean>; // Return true on success
  showAudioSection?: boolean; // If true, shows audio. If false, shows video. If undefined, shows both.
  videoOnlyTitle?: string; // Title when only video section is shown
  audioOnlyTitle?: string; // Title when only audio section is shown
}
export const UrlImport: React.FC<UrlImportProps> = ({ 
  onVideoUrlFetch, 
  onAudioUrlFetch,
  showAudioSection, // Destructure new prop
  videoOnlyTitle = "Import from URL", // Default title
  audioOnlyTitle = "Import from URL" // Default title
}) => {
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [videoSuccess, setVideoSuccess] = useState(false);
  const [audioSuccess, setAudioSuccess] = useState(false);

  const handleVideoFetch = async () => {
    if (!videoUrlInput) return;
    setIsVideoLoading(true);
    setVideoError(null);
    setVideoSuccess(false);
    const success = await onVideoUrlFetch(videoUrlInput);
    setIsVideoLoading(false);
    if (!success) {
      setVideoError('Failed to fetch video from URL. Please check the link and try again.');
    } else {
        setVideoSuccess(true);
        setVideoUrlInput(''); // Clear input on success
    }
  };

  const handleAudioFetch = async () => {
    if (!audioUrlInput) return;
    setIsAudioLoading(true);
    setAudioError(null);
    setAudioSuccess(false);
    const success = await onAudioUrlFetch(audioUrlInput);
    setIsAudioLoading(false);
    if (!success) {
      setAudioError('Failed to fetch audio from URL. Please check the link and try again.');
    } else {
        setAudioSuccess(true);
        setAudioUrlInput(''); // Clear input on success
    }
  };

  // Determine which sections to render based on the showAudioSection prop
  const shouldShowVideo = showAudioSection === undefined || showAudioSection === false;
  const shouldShowAudio = showAudioSection === undefined || showAudioSection === true;
  
  // Determine title
  let title = "Import from URL";
  if (showAudioSection === false && videoOnlyTitle) {
      title = videoOnlyTitle;
  } else if (showAudioSection === true && audioOnlyTitle) {
      title = audioOnlyTitle;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
      <h3 className="text-md font-medium text-white mb-4">{title}</h3>
      <div className={`grid ${shouldShowVideo && shouldShowAudio ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        
        {/* --- Video URL Section --- */}
        {shouldShowVideo && (
           <div>
             <label htmlFor="videoUrl" className="block text-sm font-medium text-slate-300 mb-1">
               Video URL (e.g., YouTube, Vimeo)
             </label>
             <div className="flex">
               <input 
                 type="url" 
                 id="videoUrl"
                 value={videoUrlInput}
                 onChange={(e) => setVideoUrlInput(e.target.value)}
                 placeholder="https://..."
                 className="flex-grow bg-slate-700 text-sm text-slate-300 px-3 py-2 rounded-l border border-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50"
                 disabled={isVideoLoading}
               />
               <button 
                 onClick={handleVideoFetch}
                 disabled={isVideoLoading || !videoUrlInput}
                 className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-r flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
               >
                 {isVideoLoading ? <Spinner size="sm" /> : 'Fetch Video'}
               </button>
             </div>
             {videoError && <p className="text-xs text-red-400 mt-1">{videoError}</p>}
             {videoSuccess && <p className="text-xs text-green-400 mt-1">Video URL fetched successfully!</p>}
           </div>
        )}

        {/* --- Audio URL Section --- */}
        {shouldShowAudio && (
           <div>
             <label htmlFor="audioUrl" className="block text-sm font-medium text-slate-300 mb-1">
               Audio URL (Optional)
             </label>
             <div className="flex">
               <input 
                 type="url" 
                 id="audioUrl"
                 value={audioUrlInput}
                 onChange={(e) => setAudioUrlInput(e.target.value)}
                 placeholder="https://..."
                 className="flex-grow bg-slate-700 text-sm text-slate-300 px-3 py-2 rounded-l border border-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50"
                 disabled={isAudioLoading}
               />
               <button 
                 onClick={handleAudioFetch}
                 disabled={isAudioLoading || !audioUrlInput}
                 className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-r flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
               >
                 {isAudioLoading ? <Spinner size="sm" /> : 'Fetch Audio'}
               </button>
             </div>
             {audioError && <p className="text-xs text-red-400 mt-1">{audioError}</p>}
             {audioSuccess && <p className="text-xs text-green-400 mt-1">Audio URL fetched successfully!</p>}
           </div>
        )}
      </div>
    </div>
  );
}; 