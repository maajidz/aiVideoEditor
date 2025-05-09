"use client";

import React, { useState } from 'react';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';

interface EnhancementOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPro?: boolean;
}

const enhancementOptions: EnhancementOption[] = [
  {
    id: 'auto-captions',
    name: 'Auto-Captions',
    description: 'Automatically generate and add captions to your clips',
    icon: 'ri-file-text-line'
  },
  {
    id: 'caption-styles',
    name: 'Caption Styling',
    description: 'Apply stylized captions with multiple design options',
    icon: 'ri-font-size-2',
    isPro: true
  },
  {
    id: 'b-roll',
    name: 'B-Roll Generation',
    description: 'AI-generated relevant footage to enhance your content',
    icon: 'ri-film-line',
    isPro: true
  },
  {
    id: 'auto-highlights',
    name: 'Auto-Highlights',
    description: 'Automatically detect the most engaging parts of your video',
    icon: 'ri-film-line'
  },
  {
    id: 'background-music',
    name: 'Background Music',
    description: 'Add AI-matched royalty-free music to your clips',
    icon: 'ri-music-2-line',
    isPro: true
  },
  {
    id: 'outro-generation',
    name: 'Outro Generation',
    description: 'Generate custom call-to-action outros for your clips',
    icon: 'ri-layout-bottom-line'
  }
];

export const AIEnhancementSettings = () => {
  const [enabledEnhancements, setEnabledEnhancements] = useState<string[]>([
    'auto-captions', 'auto-highlights', 'outro-generation'
  ]);
  const [captionLanguage, setCaptionLanguage] = useState('auto');
  const [musicMood, setMusicMood] = useState('energetic');
  const [enhancementStrength, setEnhancementStrength] = useState<Record<string, number>>({
    'b-roll': 50,
    'background-music': 30
  });

  const toggleEnhancement = (enhancementId: string) => {
    if (enabledEnhancements.includes(enhancementId)) {
      setEnabledEnhancements(enabledEnhancements.filter(id => id !== enhancementId));
    } else {
      setEnabledEnhancements([...enabledEnhancements, enhancementId]);
    }
  };

  const updateEnhancementStrength = (enhancementId: string, value: number) => {
    setEnhancementStrength({
      ...enhancementStrength,
      [enhancementId]: value
    });
  };

  return (
    <CollapsibleSection title="AI Enhancement Settings" initialOpen={true}>
      <div className="mb-6 p-4 bg-slate-800/50 rounded flex items-start">
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary/20 text-primary rounded-full mr-3 mt-0.5">
          <i className="ri-robot-line"></i>
        </div>
        <p className="text-sm text-slate-400">
          Choose which AI enhancements to apply to your clips. These settings will be applied to all generated clips.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {enhancementOptions.map((option) => (
          <div 
            key={option.id}
            className="bg-slate-800 rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full mr-3">
                    <i className={option.icon}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white flex items-center">
                      {option.name}
                      {option.isPro && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                          Pro
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{option.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={enabledEnhancements.includes(option.id)}
                    onChange={() => toggleEnhancement(option.id)}
                    disabled={option.isPro && false} // Replace with actual Pro status check when implemented
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Additional settings for specific enhancements */}
              {enabledEnhancements.includes(option.id) && (
                <div className="mt-3 pl-11">
                  {option.id === 'auto-captions' && (
                    <div className="mt-2">
                      <label className="block text-xs text-slate-400 mb-1">Caption Language</label>
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-slate-700 text-sm text-slate-300 px-3 py-2 rounded border border-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 pr-8"
                          value={captionLanguage}
                          onChange={(e) => setCaptionLanguage(e.target.value)}
                        >
                          <option value="auto">Auto-detect</option>
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                          <i className="ri-arrow-down-s-line"></i>
                        </div>
                      </div>
                    </div>
                  )}

                  {option.id === 'background-music' && enabledEnhancements.includes('background-music') && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Music Mood</label>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-slate-700 text-sm text-slate-300 px-3 py-2 rounded border border-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 pr-8"
                            value={musicMood}
                            onChange={(e) => setMusicMood(e.target.value)}
                          >
                            <option value="energetic">Energetic</option>
                            <option value="upbeat">Upbeat</option>
                            <option value="relaxed">Relaxed</option>
                            <option value="dramatic">Dramatic</option>
                            <option value="inspirational">Inspirational</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                            <i className="ri-arrow-down-s-line"></i>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-slate-400">Music Volume</label>
                          <span className="text-xs text-slate-400">{enhancementStrength['background-music']}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={enhancementStrength['background-music'] || 30}
                          onChange={(e) => updateEnhancementStrength('background-music', parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  )}

                  {option.id === 'b-roll' && enabledEnhancements.includes('b-roll') && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs text-slate-400">B-Roll Frequency</label>
                        <span className="text-xs text-slate-400">{enhancementStrength['b-roll']}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={enhancementStrength['b-roll'] || 50}
                        onChange={(e) => updateEnhancementStrength('b-roll', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-800">
        <span className="text-sm text-slate-400">
          {enabledEnhancements.length} enhancement{enabledEnhancements.length !== 1 ? 's' : ''} enabled
        </span>
        <div className="flex space-x-3">
          <button 
            className="text-sm text-primary hover:text-primary/80 flex items-center"
            onClick={() => setEnabledEnhancements(enhancementOptions.filter(opt => !opt.isPro).map(opt => opt.id))}
          >
            Enable Standard
          </button>
          <button 
            className="text-sm text-primary hover:text-primary/80 flex items-center"
            onClick={() => setEnabledEnhancements(enhancementOptions.map(opt => opt.id))}
          >
            <i className="ri-vip-crown-line mr-1"></i> Enable All Pro
          </button>
        </div>
      </div>
    </CollapsibleSection>
  );
}; 