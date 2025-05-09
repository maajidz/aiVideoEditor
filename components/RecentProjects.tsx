'use client';

import Link from 'next/link';
import ProjectCard from './ProjectCard';
import { useLayoutContext } from '@/app/context/LayoutContext';
import type { BackgroundUploadItem } from '@/app/context/LayoutContext';
import type { UploadStatus } from '@/types/types';

const placeholderProjects = [
  { id: "ph-1", title: "Ultimate Guide to Camera Settings", status: "processing" as UploadStatus, thumbnailUrl: "/placeholder-image.svg", originalLength: "32:45", clipsGenerated: 8, progress: 75 },
  { id: "ph-2", title: "Travel Vlog: Swiss Alps Adventure", status: "complete" as UploadStatus, thumbnailUrl: "/placeholder-image.svg", originalLength: "18:22", clipsGenerated: 12, progress: 100 },
  { id: "ph-3", title: "5-Minute Healthy Breakfast Ideas", status: "complete" as UploadStatus, thumbnailUrl: "/placeholder-image.svg", originalLength: "14:52", clipsGenerated: 6, progress: 100 },
  { id: "ph-4", title: "iPhone 16 Pro Max Review", status: "enhancing" as UploadStatus, thumbnailUrl: "/placeholder-image.svg", originalLength: "22:15", clipsGenerated: 4, progress: 60 },
];

// Priority of statuses to determine the overall batch status (most important first)
// This should align with how users perceive urgency/activity.
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
  'idle',
];

// Helper to get the representative status for the batch
const getBatchStatus = (items: BackgroundUploadItem[]): UploadStatus => {
  if (!items || items.length === 0) return 'idle';

  for (const priority of statusPriority) {
    if (items.some(item => item.status === priority)) {
      return priority;
    }
  }
  // Fallback if no items match priority (e.g., all are 'complete' but isProcessingInBackground is true)
  // or if items have statuses not in priority list
  return items[0]?.status || 'processing'; 
};

export default function RecentProjects() {
  const { isProcessingInBackground, backgroundItems, aggregateBackgroundProgress } = useLayoutContext();

  return (
    <div className="bg-slate-900 rounded p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-medium text-white">Recent Projects</h3>
        {!isProcessingInBackground && (
          <Link href="/projects" className="text-sm text-slate-400 hover:text-white flex items-center">
            <span>View All</span>
            <div className="w-4 h-4 flex items-center justify-center ml-1">
              <i className="ri-arrow-right-s-line"></i>
            </div>
          </Link>
        )}
      </div>

      {isProcessingInBackground && backgroundItems.length > 0 ? (
        () => {
          const batchStatus = getBatchStatus(backgroundItems);
          const firstItemName = backgroundItems[0]?.name;
          const title = firstItemName 
            ? `Processing: ${firstItemName}${backgroundItems.length > 1 ? ` (+${backgroundItems.length - 1} more)` : ''}` 
            : `AI Processing Batch (${backgroundItems.length} item${backgroundItems.length > 1 ? 's' : ''})`;

          const activeProjectData = {
            id: `active-processing-${backgroundItems[0]?.id || 'batch'}`,
            title: title,
            status: batchStatus,
            thumbnailUrl: "/placeholder-image.svg",
            originalLength: "--:--",
            clipsGenerated: 0,
            progress: aggregateBackgroundProgress,
          };
          return (
            <div className="grid grid-cols-1 gap-4"> 
              <ProjectCard project={activeProjectData} />
            </div>
          );
        }
      )() : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {placeholderProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
} 