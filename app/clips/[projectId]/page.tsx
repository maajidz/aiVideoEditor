"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';

// Mock data for the clip editing page
const clipData = {
  projectId: '123456',
  projectTitle: 'Ultimate Guide to Camera Settings',
  clipId: 'clip1',
  clipTitle: 'Master Aperture Settings in 60 Seconds',
  originalDuration: '01:00',
  videoSrc: 'https://readdy.ai/api/search-image?query=professional%2520podcast%2520recording%2520studio%2520with%2520two%2520people%2520having%2520a%2520conversation%252C%2520high%2520quality%2520camera%2520setup%252C%2520multiple%2520angles%252C%2520professional%2520lighting%252C%2520microphones%2520visible%252C%2520modern%2520studio%2520environment%252C%2520digital%2520displays&width=1280&height=720&seq=1&orientation=landscape',
  selectedTimeRange: {
    start: '12:34',
    end: '13:04',
  },
  platforms: [
    { id: 'instagram', name: 'Instagram', ratio: '9:16', selected: true },
    { id: 'tiktok', name: 'TikTok', ratio: '9:16', selected: false },
    { id: 'youtube', name: 'YouTube', ratio: '16:9', selected: false },
  ],
  captionStyles: [
    { id: 'modern', name: 'Modern', selected: true },
    { id: 'minimal', name: 'Minimal', selected: false },
    { id: 'gradient', name: 'Gradient', selected: false },
  ],
  enhancements: {
    intro: { enabled: false, duration: '3s' },
    outro: { 
      enabled: true, 
      duration: '5s', 
      text: 'Subscribe for more AI content!'
    },
    captions: true,
    backgroundMusic: {
      enabled: true,
      volume: 30,
      mood: 'energetic',
    },
    bRoll: {
      enabled: true,
      frequency: 50,
    },
  },
  queue: [
    {
      id: 'queued-clip-1',
      title: 'Key Point on AI Ethics',
      duration: '15s',
      platform: 'Instagram',
      thumbnail: 'https://readdy.ai/api/search-image?query=podcast%2520host%2520making%2520an%2520excited%2520gesture%2520while%2520discussing%2520AI%2520technology%252C%2520close%2520up%2520shot%252C%2520professional%2520lighting&width=120&height=68&seq=18&orientation=landscape',
      status: 'ready', // 'ready', 'processing', 'queued'
    },
    {
      id: 'queued-clip-2',
      title: 'Future of Content Creation',
      duration: '30s',
      platform: 'TikTok',
      thumbnail: 'https://readdy.ai/api/search-image?query=podcast%2520guest%2520explaining%2520concept%2520with%2520hand%2520gestures%252C%2520animated%2520expression%252C%2520professional%2520studio%2520lighting&width=120&height=68&seq=19&orientation=landscape',
      status: 'processing',
    },
    {
      id: 'queued-clip-3',
      title: 'Humorous Anecdote',
      duration: '30s',
      platform: 'Instagram',
      thumbnail: 'https://readdy.ai/api/search-image?query=podcast%2520hosts%2520laughing%2520together%252C%2520candid%2520moment%252C%2520wide%2520shot%2520showing%2520both%2520hosts%252C%2520professional%2520studio%2520lighting&width=120&height=68&seq=20&orientation=landscape',
      status: 'queued',
    },
  ],
  highlightMarkers: [
    { position: 15 }, // percentage positions in the timeline
    { position: 35 },
    { position: 68 },
    { position: 85 },
  ],
};

export default function ClipEditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  // State for the clip editor
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipDuration, setClipDuration] = useState(30); // in seconds
  const [selectionStart, setSelectionStart] = useState(20); // percentage
  const [selectionEnd, setSelectionEnd] = useState(60); // percentage
  const [selectedPlatform, setSelectedPlatform] = useState(clipData.platforms.find(p => p.selected)?.id || 'instagram');
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState(clipData.captionStyles.find(s => s.selected)?.id || 'modern');
  const [enhancements, setEnhancements] = useState(clipData.enhancements);

  // Handle platform selection
  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
  };

  // Handle caption style selection
  const handleCaptionStyleSelect = (styleId: string) => {
    setSelectedCaptionStyle(styleId);
  };

  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle enhancement toggle
  const toggleEnhancement = (enhancementKey: string, value?: boolean) => {
    setEnhancements(prev => {
      const newEnhancements = { ...prev };
      
      // Handle nested objects like backgroundMusic
      if (enhancementKey === 'intro' || enhancementKey === 'outro' || 
          enhancementKey === 'backgroundMusic' || enhancementKey === 'bRoll') {
        // @ts-ignore - we know these keys exist
        newEnhancements[enhancementKey].enabled = value !== undefined ? value : !newEnhancements[enhancementKey].enabled;
      } else {
        // @ts-ignore - simpler toggle for boolean values
        newEnhancements[enhancementKey] = value !== undefined ? value : !newEnhancements[enhancementKey];
      }
      
      return newEnhancements;
    });
  };

  // Handle duration change
  const handleDurationChange = (seconds: number) => {
    setClipDuration(seconds);
    // In a real app, we would also update the selection range based on the new duration
  };

  // Add clip to queue
  const addToQueue = () => {
    alert('Clip added to queue!');
    // In a real app, we would add the clip to the queue with the current settings
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-950">
      <Header />

      {/* Project Info Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <a href={`/review`} className="flex items-center text-slate-400 hover:text-white mr-4">
              <i className="ri-arrow-left-line mr-2"></i>
              <span>Back to Video</span>
            </a>
            <h2 className="text-lg font-medium text-white">Generate Short Clips</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-button text-sm whitespace-nowrap">
              <i className="ri-save-line"></i>
              <span>Save Draft</span>
            </button>
            <button className="flex items-center space-x-1 bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-button text-sm whitespace-nowrap">
              <i className="ri-download-line"></i>
              <span>Export All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-slate-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:space-x-6">
            {/* Left Column: Video Preview and Editor */}
            <div className="w-full lg:w-2/3 space-y-6">
              {/* Video Preview */}
              <div className="bg-slate-900 rounded-lg overflow-hidden shadow-xl">
                <div className="relative w-full aspect-video bg-black rounded-t-lg overflow-hidden">
                  <img 
                    src={clipData.videoSrc} 
                    alt="Video preview" 
                    className="w-full h-full object-cover"
                  />
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={togglePlay}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white"
                        >
                          <i className={`${isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} ri-lg`}></i>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white">
                          <i className="ri-skip-back-line"></i>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white">
                          <i className="ri-skip-forward-line"></i>
                        </button>
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white">
                            <i className="ri-volume-up-line"></i>
                          </button>
                          <input type="range" min="0" max="100" value="80" className="w-20" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-white">
                        <span className="text-sm">{`00:15 / ${clipDuration < 60 ? `00:${clipDuration}` : `01:00`}`}</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                          <i className="ri-settings-3-line"></i>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                          <i className="ri-fullscreen-line"></i>
                        </button>
                      </div>
                    </div>
                    {/* Clip Start/End Overlay */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm">
                      <span>Selected: <span className="text-primary font-medium">{clipData.selectedTimeRange.start} - {clipData.selectedTimeRange.end}</span> (30s)</span>
                    </div>
                  </div>
                  
                  {/* Clip Timeline Editor */}
                  <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">Clip Selection</h3>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded-button text-xs whitespace-nowrap">
                          <i className="ri-zoom-out-line"></i>
                        </button>
                        <button className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded-button text-xs whitespace-nowrap">
                          <i className="ri-zoom-in-line"></i>
                        </button>
                      </div>
                    </div>
                    
                    {/* Waveform Timeline - In a real app, this would be a interactive component */}
                    <div className="relative w-full h-16 bg-slate-800 rounded mb-2">
                      {/* Visualization of audio waveform - would be dynamic in real app */}
                      <div className="absolute inset-0 flex items-center justify-around px-2">
                        {Array.from({ length: 50 }).map((_, i) => (
                          <div 
                            key={i}
                            className="bg-primary w-1 rounded" 
                            style={{ 
                              height: `${Math.sin(i * 0.5) * 20 + 30}%`,
                              opacity: i >= selectionStart && i <= selectionEnd ? 1 : 0.3
                            }}
                          ></div>
                        ))}
                      </div>
                      
                      {/* AI-detected highlights */}
                      {clipData.highlightMarkers.map((marker, index) => (
                        <div 
                          key={index}
                          className="absolute top-0 h-full w-0.5 bg-secondary/80 z-10"
                          style={{ left: `${marker.position}%` }}
                        ></div>
                      ))}
                      
                      {/* Selection handles and area */}
                      <div 
                        className="absolute left-0 top-0 h-full w-1.5 bg-primary cursor-ew-resize z-20"
                        style={{ left: `${selectionStart}%` }}
                      ></div>
                      <div 
                        className="absolute right-0 top-0 h-full w-1.5 bg-primary cursor-ew-resize z-20"
                        style={{ left: `${selectionEnd}%` }}
                      ></div>
                      <div 
                        className="absolute top-0 h-full bg-primary/20 z-10"
                        style={{ left: `${selectionStart}%`, width: `${selectionEnd - selectionStart}%` }}
                      ></div>
                    </div>
                    
                    {/* Timeline Ruler */}
                    <div className="flex justify-between text-xs text-slate-400 mb-4">
                      <span>12:00</span>
                      <span>12:15</span>
                      <span>12:30</span>
                      <span>12:45</span>
                      <span>13:00</span>
                      <span>13:15</span>
                      <span>13:30</span>
                    </div>
                    
                    {/* Duration Controls */}
                    <div className="flex space-x-3 mb-4">
                      <button 
                        onClick={() => handleDurationChange(15)}
                        className={`${clipDuration === 15 ? 'bg-primary' : 'bg-slate-800 hover:bg-slate-700'} text-white px-3 py-1.5 rounded-button text-sm whitespace-nowrap`}
                      >
                        15s
                      </button>
                      <button 
                        onClick={() => handleDurationChange(30)}
                        className={`${clipDuration === 30 ? 'bg-primary' : 'bg-slate-800 hover:bg-slate-700'} text-white px-3 py-1.5 rounded-button text-sm whitespace-nowrap`}
                      >
                        30s
                      </button>
                      <button 
                        onClick={() => handleDurationChange(60)}
                        className={`${clipDuration === 60 ? 'bg-primary' : 'bg-slate-800 hover:bg-slate-700'} text-white px-3 py-1.5 rounded-button text-sm whitespace-nowrap`}
                      >
                        60s
                      </button>
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          placeholder="Custom duration (seconds)" 
                          className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-button text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button 
                        onClick={togglePlay}
                        className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-button whitespace-nowrap"
                      >
                        <i className={isPlaying ? "ri-pause-line" : "ri-play-line"}></i>
                        <span>Preview Clip</span>
                      </button>
                      <button 
                        onClick={addToQueue}
                        className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-button whitespace-nowrap flex-1"
                      >
                        <i className="ri-add-line"></i>
                        <span>Add to Queue</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* AI-Detected Highlights */}
                <div className="bg-slate-900 rounded-lg overflow-hidden shadow-xl">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-white font-medium">AI-Detected Highlights</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400">Auto-detect</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* This would be dynamically generated based on AI analysis */}
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-slate-800 rounded overflow-hidden cursor-pointer hover:shadow-lg transition">
                          <div className="relative aspect-video">
                            <img 
                              src={`https://readdy.ai/api/search-image?query=podcast%2520host%2520making%2520an%2520excited%2520gesture%2520while%2520discussing%2520AI%2520technology%252C%2520close%2520up%2520shot%252C%2520professional%2520lighting&width=300&height=169&seq=${13 + i}&orientation=landscape`} 
                              alt={`Highlight ${i + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
                                <i className="ri-play-fill ri-lg"></i>
                              </button>
                            </div>
                            <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-0.5 rounded-full">
                              {i === 0 ? 'High Engagement' : 'Medium Engagement'}
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="text-sm text-white font-medium mb-1">
                              {i === 0 ? 'Key Point on AI Ethics' : 
                               i === 1 ? 'Future of Content Creation' : 
                               'Humorous Anecdote'}
                            </h4>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">
                                {i === 0 ? '12:34 - 12:49 (15s)' : 
                                 i === 1 ? '25:40 - 26:10 (30s)' : 
                                 '38:45 - 39:15 (30s)'}
                              </span>
                              <button className="text-xs text-primary hover:text-primary/80">Select</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Clip Settings and Export Options */}
              <div className="w-full lg:w-1/3 space-y-6 mt-6 lg:mt-0">
                {/* Clip Customization */}
                <div className="bg-slate-900 rounded-lg overflow-hidden shadow-xl">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <h3 className="text-white font-medium">Clip Customization</h3>
                  </div>
                  <div className="p-4">
                    {/* Intro/Outro Options */}
                    <div className="mb-4">
                      <h4 className="text-sm text-white font-medium mb-2">Intro/Outro</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={enhancements.intro.enabled}
                              onChange={() => toggleEnhancement('intro')}
                            />
                            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            <span className="ml-3 text-sm text-slate-300">Add branded intro (3s)</span>
                          </label>
                        </div>
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={enhancements.outro.enabled}
                              onChange={() => toggleEnhancement('outro')}
                            />
                            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            <span className="ml-3 text-sm text-slate-300">Add call-to-action outro (5s)</span>
                          </label>
                        </div>
                        {enhancements.outro.enabled && (
                          <div className="mt-2">
                            <input 
                              type="text" 
                              placeholder="Custom outro text" 
                              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded text-sm" 
                              value={enhancements.outro.text} 
                              onChange={(e) => setEnhancements(prev => ({
                                ...prev, 
                                outro: { ...prev.outro, text: e.target.value }
                              }))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Platform Optimization */}
                    <div className="mb-4">
                      <h4 className="text-sm text-white font-medium mb-2">Platform Optimization</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {clipData.platforms.map(platform => (
                          <div 
                            key={platform.id}
                            onClick={() => handlePlatformSelect(platform.id)}
                            className={`cursor-pointer border ${selectedPlatform === platform.id ? 'border-primary bg-primary/10' : 'border-slate-700'} rounded p-2 flex flex-col items-center hover:translate-y-[-2px] transition-all`}
                          >
                            <div className="w-8 h-8 flex items-center justify-center mb-1">
                              <i className={`ri-${platform.id}-line ri-lg ${
                                platform.id === 'youtube' ? 'text-red-400' :
                                platform.id === 'instagram' ? 'text-pink-400' :
                                platform.id === 'tiktok' ? 'text-teal-400' :
                                platform.id === 'facebook' ? 'text-blue-400' :
                                'text-slate-400'
                              }`}></i>
                            </div>
                            <span className="text-xs text-slate-300">{platform.name}</span>
                            <span className="text-xs text-slate-500">{platform.ratio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Caption Style */}
                    <div>
                      <h4 className="text-sm text-white font-medium mb-2">Caption Style</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {clipData.captionStyles.map(style => (
                          <div
                            key={style.id}
                            onClick={() => handleCaptionStyleSelect(style.id)}
                            className={`bg-slate-800 rounded overflow-hidden cursor-pointer ${selectedCaptionStyle === style.id ? 'border-2 border-primary' : 'border border-slate-700'}`}
                          >
                            <div className="aspect-video bg-slate-700 flex items-center justify-center p-2">
                              {style.id === 'modern' && (
                                <div className="w-full bg-black/50 text-white text-center text-xs p-1 rounded">
                                  Modern
                                </div>
                              )}
                              {style.id === 'minimal' && (
                                <div className="w-full bg-white/80 text-black text-center text-xs p-1 rounded-full">
                                  Minimal
                                </div>
                              )}
                              {style.id === 'gradient' && (
                                <div className="w-full bg-gradient-to-r from-primary to-secondary text-white text-center text-xs p-1">
                                  Gradient
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Batch Export Queue */}
                <div className="bg-slate-900 rounded-lg overflow-hidden shadow-xl">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-white font-medium">Clip Queue</h3>
                    <div className="flex items-center space-x-2">
                      <button className="text-xs text-slate-400 hover:text-white">Clear All</button>
                      <span className="text-xs text-slate-500">|</span>
                      <button className="text-xs text-slate-400 hover:text-white">Select All</button>
                    </div>
                  </div>
                  <div className="p-4 max-h-[400px] overflow-y-auto">
                    <div className="space-y-3">
                      {clipData.queue.map((clip) => (
                        <div key={clip.id} className="bg-slate-800 rounded overflow-hidden hover:translate-y-[-2px] transition">
                          <div className="flex">
                            <div className="w-1/3">
                              <div className="aspect-video">
                                <img src={clip.thumbnail} alt={clip.title} className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <div className="w-2/3 p-2 relative">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-sm text-white font-medium">{clip.title}</h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-slate-400">{clip.duration}</span>
                                    <span className="text-xs text-slate-500">|</span>
                                    <span className="text-xs text-slate-400">{clip.platform}</span>
                                  </div>
                                </div>
                                <div className="flex space-x-1 h-6">
                                  <button className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300">
                                    <i className="ri-edit-line text-xs"></i>
                                  </button>
                                  <button className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300">
                                    <i className="ri-delete-bin-line text-xs"></i>
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                                  <div className={`h-full ${
                                    clip.status === 'ready' ? 'bg-green-500' : 
                                    clip.status === 'processing' ? 'bg-blue-500' : 
                                    'bg-slate-500'
                                  }`} style={{ width: clip.status === 'processing' ? '60%' : clip.status === 'ready' ? '100%' : '0%' }}></div>
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className={`text-xs ${
                                    clip.status === 'ready' ? 'text-green-500' : 
                                    clip.status === 'processing' ? 'text-blue-500' : 
                                    'text-slate-400'
                                  }`}>
                                    {clip.status === 'ready' ? 'Ready' : 
                                     clip.status === 'processing' ? 'Processing...' : 
                                     'Queued'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Export Settings */}
                  <div className="border-t border-slate-800 p-4">
                    <h4 className="text-sm text-white font-medium mb-3">Export Settings</h4>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Format</label>
                        <select className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded text-sm appearance-none">
                          <option>MP4 (H.264)</option>
                          <option>MOV</option>
                          <option>WebM</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Quality</label>
                        <select className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded text-sm appearance-none">
                          <option>High (1080p)</option>
                          <option>Medium (720p)</option>
                          <option>Low (480p)</option>
                        </select>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-button whitespace-nowrap">
                      <i className="ri-download-line"></i>
                      <span>Export All Clips</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 