// frontend/types/types.ts

// Define possible statuses for an upload item
export type UploadStatus = 
  | 'idle' 
  | 'uploading' 
  | 'analyzing' 
  | 'transcribing'
  | 'merging'
  | 'processing' 
  | 'enhancing' 
  | 'generating' 
  | 'optimizing'
  | 'complete' 
  | 'error';

// Define the structure for a platform
export interface Platform {
  id: string;
  name: string;
  icon: string; // e.g., 'ri-youtube-fill'
  aspectRatio: '16:9' | '9:16' | '1:1';
  type: 'long' | 'short';
}

// Define the structure for items being processed in the background
export interface BackgroundUploadItem {
  id: string;
  name: string; // Video file name or URL
  status: UploadStatus; // Use the shared status type
  progress: number;
}

// Define the structure for each upload item in the frontend state
export interface UploadItem {
  id: string;
  file: File | null;
  videoUrl: string | null;
  audioFile: File | null;
  audioUrl: string | null;
  title: string;
  description: string;
  thumbnailUrl: string | null; // Allow null
  duration: number | null;    // Allow null
  status: UploadStatus;
  progress: number; // 0-100
  errorMessage?: string | null;
  // UI state specific to the card
  wantsSeparateAudio?: boolean;
  showAddAudioLink?: boolean;
}

// Define return type for URL metadata fetch API
export interface VideoUrlFetchResult {
    success: boolean;
    title?: string;
    thumbnailUrl?: string | null; // Explicitly allow null from API
    duration?: number | null;    // Explicitly allow null from API
    error?: string;
} 