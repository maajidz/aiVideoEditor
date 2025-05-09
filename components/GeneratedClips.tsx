import Link from 'next/link';
import ClipCard from './ClipCard';
import { Platform } from '@/types/types'; // Import the Platform type

// Placeholder data for Platform objects
const samplePlatforms: { [key: string]: Platform } = {
  YouTube: { id: 'yt', name: 'YouTube', icon: 'ri-youtube-fill', aspectRatio: '16:9', type: 'long' },
  Instagram: { id: 'ig', name: 'Instagram', icon: 'ri-instagram-fill', aspectRatio: '9:16', type: 'short' },
  TikTok: { id: 'tt', name: 'TikTok', icon: 'ri-tiktok-fill', aspectRatio: '9:16', type: 'short' },
};

const placeholderClips = [
  {
    id: 'clip1',
    title: 'Perfect Camera Settings for Portraits',
    duration: '1:45',
    thumbnailUrl: '/placeholder-image.svg',
    views: '1.2K',
    platform: samplePlatforms.YouTube, // Use Platform object
  },
  {
    id: 'clip2',
    title: 'Top 3 Must-Visit Spots in Swiss Alps',
    duration: '0:58',
    thumbnailUrl: '/placeholder-image.svg',
    views: '3.4K',
    platform: samplePlatforms.Instagram,
  },
  {
    id: 'clip3',
    title: '60-Second Protein-Packed Breakfast',
    duration: '0:42',
    thumbnailUrl: '/placeholder-image.svg',
    views: '5.7K',
    platform: samplePlatforms.TikTok,
  },
  {
    id: 'clip4',
    title: 'iPhone 16 Pro Camera Test in Low Light',
    duration: '1:22',
    thumbnailUrl: '/placeholder-image.svg',
    views: '2.1K',
    platform: samplePlatforms.YouTube,
  },
  // Add more clips if needed
];

export default function GeneratedClips() {
  // TODO: Fetch actual clip data

  return (
    <div className="bg-slate-900 rounded p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-medium text-white">Generated Clips</h3>
        <Link href="/clips" className="text-sm text-slate-400 hover:text-white flex items-center">
          <span>View All</span>
          <div className="w-4 h-4 flex items-center justify-center ml-1">
            <i className="ri-arrow-right-s-line"></i>
          </div>
        </Link>
      </div>
      {/* Added overflow-y-auto and flex-1 to make the list scrollable within the container */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {placeholderClips.map((clip, index) => (
          <ClipCard key={index} clip={clip} />
        ))}
      </div>
    </div>
  );
} 