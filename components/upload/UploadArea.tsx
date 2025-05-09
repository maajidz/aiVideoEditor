"use client"; // Needs state for drag/drop and file handling later

import React, { useState, useRef, useCallback, useEffect } from 'react';

// Hoist helper function - Add back here
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface UploadAreaProps {
  title: string;
  description: string;
  acceptedFormats: string; // e.g., "video/mp4,video/mov"
  iconClass: string; // e.g., "ri-video-upload-line"
  inputId: string;
  maxSizeMB?: number;
  planTier?: string;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean; // Add disabled prop
  selectedFileName?: string | null; // Allow external control of selected file name
  showAddAudioLink?: boolean;
  onAddAudioClick?: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  title,
  description,
  acceptedFormats,
  iconClass,
  inputId,
  maxSizeMB,
  planTier,
  onFileSelect,
  disabled = false, // Default to false
  selectedFileName: externalSelectedFileName = null, // Default to null
  showAddAudioLink = false,
  onAddAudioClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  // Internal state to manage file object when selected via input/drag
  const [internalSelectedFile, setInternalSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use external prop primarily, fall back to internal state only if prop is null/undefined
  const displayFileName = externalSelectedFileName ?? internalSelectedFile?.name;
  const displayFileSize = internalSelectedFile ? formatFileSize(internalSelectedFile.size) : null;

  // Effect to clear internal state if external name is cleared (e.g., URL selected)
  useEffect(() => {
    if (externalSelectedFileName === null && internalSelectedFile !== null) {
        setInternalSelectedFile(null);
         if (fileInputRef.current) {
           fileInputRef.current.value = ''; // Reset file input
         }
    }
  }, [externalSelectedFileName, internalSelectedFile]); // Added dependency

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = event.target.files?.[0] || null;
    setInternalSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    if (disabled) return;
    setInternalSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(false);
  }, [disabled]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault(); // Necessary to allow drop
  }, [disabled]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0] || null;
      if (file) {
        // Optional: Add validation for file type and size here
        setInternalSelectedFile(file);
        onFileSelect(file);
        // Note: Cannot directly set the value of file input for dropped files
      }
    },
    [onFileSelect, disabled]
  );

  return (
    <div className={`bg-slate-900 rounded p-6 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-4">{description}</p>

      {!displayFileName ? (
        <div
          className={`upload-area rounded flex flex-col items-center justify-center p-8 mb-4 border-2 border-dashed 
            ${isDragging && !disabled ? 'border-primary bg-primary/5' : 'border-slate-700'}
            ${disabled ? 'cursor-not-allowed' : ''}
            transition-colors duration-200`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className={`w-16 h-16 flex items-center justify-center bg-slate-800 rounded-full mb-4 ${disabled ? 'text-slate-600' : 'text-primary'}`}>
            <i className={`${iconClass} text-2xl`}></i>
          </div>
          <p className="text-center text-sm mb-2">Drag & drop your file here</p>
          <p className="text-center text-xs text-slate-400 mb-4">or</p>
          <label htmlFor={inputId} className={`px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-button whitespace-nowrap ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
            Browse Files
          </label>
          <input
            type="file"
            id={inputId}
            ref={fileInputRef}
            className="hidden"
            accept={acceptedFormats}
            onChange={handleFileChange}
            disabled={disabled}
          />
          <p className="text-xs text-slate-400 mt-4">Supported formats: {acceptedFormats.split(',').map(f => f.split('/')[1].toUpperCase()).join(', ')}</p>
          {maxSizeMB && (
            <p className="text-xs text-slate-400">Max file size: {maxSizeMB}GB {planTier ? `(${planTier} Plan)` : ''}</p>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="bg-slate-800 rounded p-3 flex items-center">
              <div className={`w-10 h-10 flex items-center justify-center rounded mr-3 ${disabled ? 'bg-slate-600 text-slate-400' : 'bg-slate-700 text-primary'}`}>
                <i className={`${iconClass}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{displayFileName}</p>
                {displayFileSize && <p className="text-xs text-slate-400">{displayFileSize}</p>}
              </div>
              <button 
                className={`p-2 text-slate-400 hover:text-white ${disabled ? 'hidden' : ''}`} 
                onClick={handleRemoveFile}
                disabled={disabled}
                title="Remove file"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
          {showAddAudioLink && onAddAudioClick && !disabled && (
             <div className="mt-2 pl-1">
                 <button 
                     onClick={onAddAudioClick}
                     className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium"
                 >
                     <i className="ri-add-line mr-1"></i>
                     Add separate audio track
                 </button>
             </div>
         )}
        </>
      )}
    </div>
  );
}; 