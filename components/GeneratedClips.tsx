import Link from 'next/link';
import ClipCard from './ClipCard';

// Placeholder data
const placeholderClips = [
  {
    id: 'clip1',
    title: 'Perfect Camera Settings for Portraits',
    duration: '1:45',
    thumbnailUrl: '/placeholder-image.svg',
    views: '1.2K',
    platform: 'YouTube',
  },
  {
    id: 'clip2',
    title: 'Top 3 Must-Visit Spots in Swiss Alps',
    duration: '0:58',
    thumbnailUrl: '/placeholder-image.svg',
    views: '3.4K',
    platform: 'Instagram',
  },
  {
    id: 'clip3',
    title: '60-Second Protein-Packed Breakfast',
    duration: '0:42',
    thumbnailUrl: '/placeholder-image.svg',
    views: '5.7K',
    platform: 'TikTok',
  },
  {
    id: 'clip4',
    title: 'iPhone 16 Pro Camera Test in Low Light',
    duration: '1:22',
    thumbnailUrl: '/placeholder-image.svg',
    views: '2.1K',
    platform: 'YouTube',
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
          // We need to cast the platform string to the Platform type here
          <ClipCard key={index} clip={{...clip, platform: clip.platform as any}} />
        ))}
      </div>
    </div>
  );
} 