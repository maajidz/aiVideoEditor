import Image from 'next/image';
import { UploadStatus } from '@/types/types'; // Import the detailed UploadStatus
import Link from 'next/link'; // Import Link

// Mappings for status display (similar to BackgroundProcessingToast)
// These could be moved to a shared utils file if used in many places
export const statusDescriptions: Record<UploadStatus, string> = {
  'idle': 'Queued',
  'uploading': 'Uploading',
  'analyzing': 'Analyzing',
  'transcribing': 'Transcribing',
  'merging': 'Merging',
  'processing': 'Processing',
  'enhancing': 'Enhancing',
  'generating': 'Generating Clips',
  'optimizing': 'Optimizing',
  'complete': 'Completed',
  'error': 'Error'
};

export const statusColors: Record<UploadStatus, string> = {
  'idle': 'bg-slate-500',
  'uploading': 'bg-blue-500',
  'analyzing': 'bg-indigo-500',
  'transcribing': 'bg-cyan-500',
  'merging': 'bg-teal-500',
  'processing': 'bg-amber-500',
  'enhancing': 'bg-purple-500',
  'generating': 'bg-pink-500',
  'optimizing': 'bg-green-600',
  'complete': 'bg-emerald-500',
  'error': 'bg-rose-500'
};

export const statusIcons: Record<UploadStatus, string> = {
  'idle': 'ri-time-line',
  'uploading': 'ri-upload-cloud-line',
  'analyzing': 'ri-brain-line',
  'transcribing': 'ri-text-wrap',
  'merging': 'ri-merge-cells-horizontal',
  'processing': 'ri-cpu-line',
  'enhancing': 'ri-magic-line',
  'generating': 'ri-movie-line',
  'optimizing': 'ri-settings-5-line',
  'complete': 'ri-check-circle-line',
  'error': 'ri-error-warning-line'
};

interface ProjectCardProps {
  title: string;
  status: UploadStatus; // Use detailed status
  thumbnailUrl: string;
  originalLength: string;
  clipsGenerated: number;
  progress: number; // Use progress (0-100)
  id: string; // Added for key if mapping over projects
}

// Example placeholder data - update to reflect new status and progress
const defaultProject: ProjectCardProps = {
  id: "default-123",
  title: "Ultimate Guide to Camera Settings",
  status: "processing", // Example detailed status
  thumbnailUrl: "/placeholder-project-1.jpg",
  originalLength: "32:45",
  clipsGenerated: 0, // Initially 0
  progress: 75, // Current progress for the 'processing' status
};

export default function ProjectCard({ project = defaultProject }: { project?: ProjectCardProps }) {
  const { title, status, thumbnailUrl, originalLength, clipsGenerated, progress } = project;

  const currentStatusDescription = statusDescriptions[status] || 'Processing';
  const currentStatusColor = statusColors[status] || 'bg-primary';
  const currentStatusIcon = statusIcons[status] || 'ri-loader-4-line';
  const isProcessing = status !== 'complete' && status !== 'error' && status !== 'idle';
  const isCompleted = status === 'complete'; // Added for clarity

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col h-full shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
      <div className="relative mb-3 rounded overflow-hidden aspect-video group bg-slate-700 flex items-center justify-center">
        {isCompleted && thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {isProcessing && (
          <div className="text-center text-slate-400 p-4">
            <i className="ri-image-edit-line text-4xl animate-pulse mb-2"></i>
            <p className="text-sm">Generating thumbnail options...</p>
          </div>
        )}
        {!isCompleted && !isProcessing && (
          <div className="text-center text-slate-500 p-4">
            <i className="ri-image-line text-4xl"></i>
            <p className="text-sm">{status === 'error' ? 'Error loading thumbnail' : 'Thumbnail unavailable'}</p>
          </div>
        )}
        {/* Status Badge - always visible on top of whatever is in the background */}
        <div className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 ${currentStatusColor} text-white rounded-full flex items-center space-x-1 z-10`}>
          <i className={`${currentStatusIcon} ${isProcessing ? 'animate-spin' : ''}`}></i>
          <span>{currentStatusDescription}</span>
        </div>
      </div>
      <h4 className="font-medium text-white mb-1 truncate" title={title}>{title}</h4>
      <p className="text-xs text-slate-400 mb-3">
        Original: {originalLength} {clipsGenerated > 0 ? `• ${clipsGenerated} clips` : ''}
      </p>
      
      {isProcessing && (
        <div className="mb-3 mt-auto">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">{currentStatusDescription}</span>
            <span className="text-slate-300">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${currentStatusColor} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {(status === 'complete' || status === 'error') && !isProcessing && (
         <div className="mb-3 mt-auto text-xs text-center py-2">
            {status === 'complete' && <span className="text-emerald-400"><i className="ri-check-double-line mr-1"></i>Completed</span>}
            {status === 'error' && <span className="text-rose-400"><i className="ri-alert-line mr-1"></i>Processing Error</span>}
         </div>
      )}

      {/* Action buttons for completed projects */}
      {isCompleted && (
        <div className="grid grid-cols-2 gap-2 mt-auto mb-3 pt-3 border-t border-slate-700/50">
          <Link href={`/review?projectId=${project.id}`} className="flex items-center justify-center text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-button whitespace-nowrap">
            <i className="ri-eye-line mr-1.5"></i> Review
          </Link>
          <Link href={`/clips/${project.id}`} className="flex items-center justify-center text-xs px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-button whitespace-nowrap">
            <i className="ri-scissors-cut-line mr-1.5"></i> Edit Clips
          </Link>
        </div>
      )}

      {/* Footer with platform icons and more options - shown if not completed or if completed and buttons above are present */}
      {(!isCompleted || (isCompleted && project.id /* ensure project.id exists to show this section */)) && (
        <div className={`flex justify-between items-center ${isCompleted ? 'pt-0' : 'pt-2 border-t border-slate-700/50'}`}>
          <div className="flex -space-x-2">
            {/* Placeholder platform icons */}
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">
              <i className="ri-youtube-fill text-red-500"></i>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">
              <i className="ri-tiktok-fill text-slate-300"></i>
            </div>
          </div>
          <button className="text-xs text-slate-300 hover:text-white flex items-center p-1 -mr-1 rounded hover:bg-slate-700">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>
      )}
    </div>
  );
} 