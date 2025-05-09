"use client";

import React, { useState, useEffect } from 'react';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { AspectRatioDropdown, getAspectRatioIcon } from '@/components/shared/AspectRatioDropdown';

// Define platform types and their properties
interface PlatformOption {
  id: string;
  name: string;
  icon: string;
  aspectRatios: string[];
  type: 'long' | 'short'; // Add type to distinguish
}

const allPlatformOptions: PlatformOption[] = [
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: 'ri-youtube-line', 
    aspectRatios: ['16:9'], // Only 16:9 for long-form
    type: 'long'
  },
  {
    id: 'yt_shorts', // Separate ID for shorts
    name: 'YT Shorts', 
    icon: 'ri-youtube-line', 
    aspectRatios: ['9:16', '1:1'],
    type: 'short'
  },
  {
    id: 'instagram', 
    name: 'Instagram Reels', // Specify Reels
    icon: 'ri-instagram-line', 
    aspectRatios: ['9:16', '1:1'], 
    type: 'short'
  },
  {
    id: 'tiktok', 
    name: 'TikTok', 
    icon: 'ri-tiktok-line', 
    aspectRatios: ['9:16', '1:1'],
    type: 'short'
  },
  // Add other short-form platforms if needed
  // {
  //   id: 'facebook_reels',
  //   name: 'Facebook Reels',
  //   icon: 'ri-facebook-line',
  //   aspectRatios: ['9:16'],
  //   type: 'short'
  // },
];

// Filter options by type
const longFormOptions = allPlatformOptions.filter(p => p.type === 'long');
const shortFormOptions = allPlatformOptions.filter(p => p.type === 'short');

// Helper function to render aspect ratio settings using the new dropdown
const renderAspectRatioSettings = (
    platformIds: string[], 
    selectedAspectRatios: Record<string, string>, 
    handleAspectRatioChange: (platformId: string, aspectRatio: string) => void,
    sectionTitle: string
) => {
  if (platformIds.length === 0) return null;

  return (
    <div className="space-y-4 mt-4">
      <h4 className="text-md font-medium text-white">{sectionTitle}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platformIds.map((platformId) => {
          const platform = allPlatformOptions.find(p => p.id === platformId);
          if (!platform) return null;
          
          const showAspectRatioSelect = platform.aspectRatios.length >= 1;
          // Prepare options for the custom dropdown
          const dropdownOptions = platform.aspectRatios.map(ratio => ({
            id: ratio,
            label: ratio,
            icon: React.createElement(getAspectRatioIcon(ratio)) // Create element from icon component
          }));

          return (
            <div key={`aspect-${platformId}`} className="bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <i className={`${platform.icon} text-lg mr-2 text-slate-300`}></i>
                <span className="text-sm font-medium text-white">{platform.name}</span>
              </div>
              
              {showAspectRatioSelect ? (
                <div className="mt-2">
                  <label className="block text-xs text-slate-400 mb-1">Aspect Ratio</label>
                  <AspectRatioDropdown
                    options={dropdownOptions}
                    value={selectedAspectRatios[platformId] || platform.aspectRatios[0]}
                    onChange={(newValue) => handleAspectRatioChange(platformId, newValue)}
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <label className="block text-xs text-slate-400 mb-1">Aspect Ratio</label>
                  <div className="flex items-center text-sm text-slate-300 px-3 py-2 bg-slate-700 rounded">
                    {React.createElement(getAspectRatioIcon(platform.aspectRatios[0]))}
                    {selectedAspectRatios[platformId] || platform.aspectRatios[0]}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PlatformSelection = () => {
  const [selectedLongForm, setSelectedLongForm] = useState<string[]>(['youtube']); // Default YouTube
  const [selectedShortForm, setSelectedShortForm] = useState<string[]>([]);
  // Aspect ratio state might need adjustment if different ratios are needed per type
  const [selectedAspectRatios, setSelectedAspectRatios] = useState<Record<string, string>>({
    youtube: '16:9' // Default aspect ratio for YouTube long form
  });
  const [isAllShortsSelected, setIsAllShortsSelected] = useState(false);

  // Effect to sync individual short selections with the master checkbox
  useEffect(() => {
    const allShortIds = shortFormOptions.map(p => p.id);
    const allSelected = allShortIds.length > 0 && allShortIds.every(id => selectedShortForm.includes(id)); // Check length > 0
    setIsAllShortsSelected(allSelected);
  }, [selectedShortForm]);

  // Effect to set default aspect ratios when platforms are selected
  useEffect(() => {
    const newAspectRatios = { ...selectedAspectRatios };
    const allSelected = [...selectedLongForm, ...selectedShortForm];
    let changed = false;

    allSelected.forEach(platformId => {
      if (!newAspectRatios[platformId]) {
        const platform = allPlatformOptions.find(p => p.id === platformId);
        if (platform && platform.aspectRatios.length > 0) {
          newAspectRatios[platformId] = platform.aspectRatios[0];
          changed = true;
        }
      }
    });

    // Clean up aspect ratios for deselected platforms
    Object.keys(newAspectRatios).forEach(platformId => {
        if (!allSelected.includes(platformId)) {
            delete newAspectRatios[platformId];
            changed = true;
        }
    });

    if (changed) {
        setSelectedAspectRatios(newAspectRatios);
    }

  }, [selectedLongForm, selectedShortForm]); // Dependency updated

  const toggleShortPlatform = (platformId: string) => {
    setSelectedShortForm(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const toggleAllShorts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setIsAllShortsSelected(isChecked);
    if (isChecked) {
      setSelectedShortForm(shortFormOptions.map(p => p.id));
    } else {
      setSelectedShortForm([]);
    }
  };

  // Combine selected platforms for aspect ratio section
  const allSelectedPlatforms = [...selectedLongForm, ...selectedShortForm];

  const handleAspectRatioChange = (platformId: string, aspectRatio: string) => {
    setSelectedAspectRatios({
      ...selectedAspectRatios,
      [platformId]: aspectRatio
    });
  };

  return (
    <CollapsibleSection title="Platform Selection" initialOpen={true}>
      <div className="mb-6 p-4 bg-slate-800/50 rounded flex items-start">
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary/20 text-primary rounded-full mr-3 mt-0.5">
          <i className="ri-information-line"></i>
        </div>
        <p className="text-sm text-slate-400">
          Select where to publish. Long form defaults to YouTube. Check "Short Form" to select all short video platforms.
        </p>
      </div>

      <div className="mb-6 pb-6 border-b border-slate-800">
        <h4 className="text-md font-medium text-white mb-3">Long Form Video</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-3">
          {longFormOptions.map((platform) => (
            <div 
              key={platform.id}
              // Long form (YouTube) is always selected and not clickable for now
              className={`border border-primary bg-primary/10 rounded-lg p-4 flex flex-col items-center justify-center opacity-70 cursor-default`}
            >
              <div className="w-10 h-10 flex items-center justify-center mb-2">
                <i className={`${platform.icon} text-2xl text-primary`}></i>
              </div>
              <span className={`text-sm text-primary`}>
                {platform.name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 pl-1">
            <p className="text-xs text-slate-400">Aspect Ratio: <span className="text-slate-300 font-medium">16:9</span> (Fixed for YouTube Long Form)</p>
         </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-white">Short Form Clips</h4>
           <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary/50"
                checked={isAllShortsSelected}
                onChange={toggleAllShorts}
              />
              <span className="ml-2 text-sm text-slate-300">Select All Shorts</span>
            </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {shortFormOptions.map((platform) => (
            <div 
              key={platform.id}
              onClick={() => toggleShortPlatform(platform.id)}
              className={`cursor-pointer border ${selectedShortForm.includes(platform.id) 
                ? 'border-primary bg-primary/10' 
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
              } rounded-lg p-4 flex flex-col items-center justify-center transition-all hover:translate-y-[-2px]`}
            >
              <div className="w-10 h-10 flex items-center justify-center mb-2">
                <i className={`${platform.icon} text-2xl ${selectedShortForm.includes(platform.id) ? 'text-primary' : 'text-slate-400'}`}></i>
              </div>
              <span className={`text-sm ${selectedShortForm.includes(platform.id) ? 'text-primary' : 'text-slate-300'}`}>
                {platform.name}
              </span>
            </div>
          ))}
        </div>
        
        {renderAspectRatioSettings(selectedShortForm, selectedAspectRatios, handleAspectRatioChange, "Short Form Aspect Ratios")}
      </div>
    </CollapsibleSection>
  );
}; 