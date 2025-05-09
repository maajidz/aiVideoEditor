import Image from 'next/image';
import { Platform } from '@/types/types'; // Import the Platform interface

// Define platform types (extend as needed)
// REMOVE_LINE type Platform = 'YouTube' | 'Instagram' | 'TikTok' | 'Facebook' | 'Twitter';

interface ClipCardProps {
  title: string;
  thumbnailUrl: string;
  duration: string;
  views: string; // Or number, formatting handled in component
  platform: Platform; // Use the imported Platform interface
}

// Example placeholder data
const defaultClip: ClipCardProps = {
  title: "Perfect Camera Settings for Portraits",
  thumbnailUrl: "/placeholder-clip-1.jpg", // Use placeholder image
  duration: "1:45",
  views: "1.2K",
  platform: { // Update to use Platform object
    id: 'youtube',
    name: 'YouTube',
    icon: 'ri-youtube-fill',
    aspectRatio: '16:9',
    type: 'long',
  },
};

export default function ClipCard({ clip = defaultClip }: { clip?: ClipCardProps }) {
  const { title, thumbnailUrl, duration, views, platform } = clip;

  const getPlatformStyle = () => {
    switch (platform.name) { // Use platform.name
      case 'Instagram': return "bg-pink-500/20 text-pink-400";
      case 'TikTok': return "bg-slate-600/80 text-slate-300";
      case 'Facebook': return "bg-blue-500/20 text-blue-400";
      case 'Twitter': return "bg-sky-500/20 text-sky-400";
      case 'YouTube':
      default: return "bg-primary/20 text-primary";
    }
  };

  return (
    // Added group class for hover effect on actions
    <div className="bg-slate-800 rounded p-3 group">
      <div className="flex">
        <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0 mr-3">
          <Image
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate mb-0.5" title={title}>{title}</h4>
          <p className="text-xs text-slate-400 mb-1">Duration: {duration}</p>
          <div className="flex items-center text-xs text-slate-400">
            <i className="ri-eye-line w-3 h-3 mr-1"></i>
            <span>{views} views</span>
          </div>
        </div>
      </div>
      {/* Clip actions - visible on hover due to group class */}
      <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
        <div className="flex space-x-1">
          <button title="Edit" className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded">
            <span className="sr-only">Edit Clip</span>
            <i className="ri-edit-line w-3.5 h-3.5"></i>
          </button>
          <button title="Share" className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded">
             <span className="sr-only">Share Clip</span>
            <i className="ri-share-line w-3.5 h-3.5"></i>
          </button>
          <button title="Download" className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded">
            <span className="sr-only">Download Clip</span>
            <i className="ri-download-line w-3.5 h-3.5"></i>
          </button>
        </div>
        <div className="flex items-center">
          <span className={`text-xs font-medium px-2 py-0.5 ${getPlatformStyle()} rounded-full`}>{platform.name}</span>
        </div>
      </div>
    </div>
  );
} 