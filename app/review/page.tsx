"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';

// Types
type EditPanelTab = 'ai-suggestions' | 'text-editor' | 'tools' | 'captions' | 'audio' | 'visual' | 'transitions' | 'b-roll' | 'text-graphics' | 'angles' | 'thumbnails'; // Added 'thumbnails'
type SourceFilter = 'all' | 'video' | 'audio' | 'images';

interface CommandSuggestion {
  text: string;
  tab: EditPanelTab | 'general'; // To categorize suggestions
}

// Types for Audio Tab
interface AudioTrack {
  id: string;
  name: string;
  volume: number; // 0-100
  isMuted: boolean;
  sourceType: 'main' | 'music' | 'sfx';
  sourceFile?: string; // URL or path
  effects: string[]; // e.g., ['reverb-small', 'noise-reduction']
}

interface AiSoundSuggestion {
  id: string;
  description: string; // e.g., "Add applause sound for the speech at 5:30"
  soundPreviewUrl?: string;
  timeCue?: string; // e.g., "5:30"
  category: 'sfx' | 'music-sting' | 'ambience';
  icon: string; // Remixicon class
}

// Types for Visual Tab
interface VisualEffect {
  id: string;
  name: string;
  type: 'filter' | 'color-correction' | 'overlay' | 'transform';
  isEnabled: boolean;
  properties: {
    // Common
    intensity?: number; // 0-1
    // Filter specific
    filterPreset?: string; // e.g., 'vintage-02', 'sepia'
    // Color Correction specific
    brightness?: number; // -1 to 1 (or 0-2)
    contrast?: number;   // -1 to 1 (or 0-2)
    saturation?: number; // -1 to 1 (or 0-2)
    temperature?: number; // e.g., -100 to 100 (cool to warm)
    tint?: number;       // e.g., -100 to 100 (green to magenta)
    // Overlay specific
    overlayUrl?: string;
    opacity?: number; // 0-1
    scale?: number; // 0.1 - 5
    rotation?: number; // 0-360
    blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'lighten' | 'darken';
    // Transform specific
    position?: { x: number; y: number }; // percentages or pixels
    crop?: { top: number; right: number; bottom: number; left: number }; // percentages
    zoom?: number; // 0.1 - 5
    // Stabilization specific (can be part of transform or its own effect type)
    stabilizationStrength?: number; // 0-1, if applicable to this effect type
  };
}

interface AiVisualSuggestion {
  id: string;
  description: string; // e.g., "Improve face lighting for Host 1 at 2:15-3:00"
  timeCue?: string;
  previewImageUrl?: string;
  effectType: VisualEffect['type'] | 'lighting' | 'framing' | 'stabilization';
  icon: string; // Remixicon class
  details: {
    // For lighting (maps to color-correction)
    brightnessTarget?: number;
    contrastTarget?: number;
    saturationTarget?: number;
    targetArea?: 'face-host1' | 'face-host2' | 'overall-scene'; // Helps AI decide or user understand
    // For framing (maps to transform)
    cropRect?: { top: number; right: number; bottom: number; left: number }; // percentages 0-1
    zoomFactor?: number;
    // For filter
    filterPresetToApply?: string;
    intensity?: number;
    // For stabilization (could be a specific effect type or a property of transform)
    stabilizationLevel?: 'low' | 'medium' | 'high';
  };
}

// Types for B-Roll Tab
interface BRollClip {
  id: string;
  name: string;
  thumbnailUrl?: string;
  videoUrl: string;
  source: 'ai-library' | 'user-upload' | 'project-asset';
  duration: number; // seconds
  startTimeInMainVideo?: number; // seconds, where it's inserted
  // Potentially other properties like volume adjustment for the B-roll clip itself
}

interface AiBRollSuggestion {
  id: string;
  description: string; // e.g., "Add B-roll of 'data visualization' for tech discussion at 15:30"
  keywords: string[]; // For searching library
  timeCue: string; // e.g., "15:30-16:00"
  suggestedClips?: Partial<BRollClip>[]; // Top few matches from library
  icon: string;
}

// Extended BRollClip for Library
interface LibraryBRollClip extends BRollClip {
  tags?: string[];
  mood?: string[]; // e.g., 'uplifting', 'dramatic', 'calm'
  resolution?: string; // e.g., '1080p', '4K'
  orientation?: 'landscape' | 'portrait' | 'square';
  description?: string;
  license?: string; // e.g., 'Royalty-Free', 'CC0'
}

// Sample data for the timeline segments
const timelineSegments = [
  { id: 'intro', title: 'Intro', startTime: '0:00', endTime: '4:45', color: 'blue-500', width: '8', image: 'https://readdy.ai/api/search-image?query=podcast%20intro%20screen%20with%20logo%20and%20host%20introduction%2C%20professional%20lighting%2C%20studio%20environment&width=160&height=90&seq=2&orientation=landscape', keywords: ['introduction', 'podcast opening', 'welcome', 'logo reveal'] },
  { id: 'topic1', title: 'AI Basics', startTime: '4:45', endTime: '13:30', color: 'green-500', width: '15', markerColor: 'blue-400', image: 'https://readdy.ai/api/search-image?query=two%20people%20discussing%20in%20podcast%20studio%2C%20close%20up%20shot%2C%20animated%20conversation%2C%20professional%20lighting&width=160&height=90&seq=3&orientation=landscape', keywords: ['artificial intelligence', 'machine learning', 'neural networks', 'tech concepts', 'data'] },
  { id: 'content-creation', title: 'Content Creation', startTime: '13:30', endTime: '25:15', color: 'purple-500', width: '18', markerColor: 'orange-400', image: 'https://readdy.ai/api/search-image?query=podcast%20b-roll%20showing%20AI%20technology%20visualization%2C%20digital%20interface%2C%20data%20visualization&width=160&height=90&seq=4&orientation=landscape', keywords: ['video production', 'creativity', 'digital tools', 'editing software', 'graphic design'] },
  { id: 'interview', title: 'Expert Interview', startTime: '25:15', endTime: '38:30', color: 'yellow-500', width: '22', markerColor: 'red-400', image: 'https://readdy.ai/api/search-image?query=podcast%20interview%20with%20guest%20expert%2C%20three%20people%20in%20conversation%2C%20professional%20studio%20setup%20with%20multiple%20camera%20angles&width=160&height=90&seq=5&orientation=landscape', keywords: ['interview', 'expert discussion', 'conversation', 'studio guest', 'professional talk'] },
  { id: 'future-trends', title: 'Future Trends', startTime: '38:30', endTime: '50:15', color: 'teal-500', width: '20', markerColor: 'green-400', image: 'https://readdy.ai/api/search-image?query=podcast%20hosts%20discussing%20future%20technology%2C%20animated%20hand%20gestures%2C%20close%20up%20shot%20with%20shallow%20depth%20of%20field&width=160&height=90&seq=6&orientation=landscape', keywords: ['future technology', 'innovation', 'predictions', 'emerging tech', 'advancements'] },
  { id: 'conclusion', title: 'Conclusion', startTime: '50:15', endTime: '58:21', color: 'blue-500', width: '17', markerColor: 'purple-400', image: 'https://readdy.ai/api/search-image?query=podcast%20outro%20with%20hosts%20concluding%20discussion%2C%20call%20to%20action%20graphics%2C%20professional%20lighting&width=160&height=90&seq=7&orientation=landscape', keywords: ['summary', 'final thoughts', 'call to action', 'podcast ending', 'credits'] },
];

// Sample AI suggestions
const aiSuggestions = [
  { id: 1, title: "Enhance Audio Clarity", type: "Technical", time: "12:34 - 15:20", desc: "Background noise detected. I can reduce it to improve speaker clarity.", icon: "ri-sound-module-line", color: "blue" },
  { id: 2, title: "Add B-Roll", type: "Visual", time: "25:40 - 26:15", desc: "This AI technologies discussion would benefit from relevant visual aids.", icon: "ri-movie-line", color: "purple" },
  { id: 3, title: "Add Animated Captions", type: "Engagement", time: "38:45 - 39:20", desc: "Key statistics mentioned here would stand out with animated text.", icon: "ri-text-spacing", color: "yellow" },
  { id: 4, title: "Switch Camera Angle", type: "Visual", time: "42:10 - 43:35", desc: "Emotional discussion detected. Close-up angle would enhance viewer connection.", icon: "ri-camera-switch-line", color: "green" },
  { id: 5, title: "Trim Silence", type: "Pacing", time: "18:20 - 18:24", desc: "Extended pause detected. I can remove 3.5s to improve pacing.", icon: "ri-scissors-cut-line", color: "red" },
];

// Sample Transcript Data
const initialTranscriptData = [
  { id: 't1', time: "00:35", speaker: "Host 1", text: "Welcome to the podcast! Today we are discussing AI in content creation and how it is changing the game.", isKeyPoint: false, fillerWords: [] },
  { id: 't2', time: "00:42", speaker: "Host 2", text: "I am, uh, really excited about this topic. It is transforming how we produce videos, you know, and podcasts.", isKeyPoint: true, fillerWords: ['uh', 'you know'] },
  { id: 't3', time: "00:57", speaker: "Host 1", text: "Absolutely. So, let us dive into the basic concepts first, shall we?", isKeyPoint: false, fillerWords: ['So'] },
  { id: 't4', time: "04:45", speaker: "Host 2", text: "AI technology has progressed rapidly in the last few years. It is quite amazing, actually.", isKeyPoint: true, fillerWords: [] },
  { id: 't5', time: "25:15", speaker: "Guest", text: "From my experience in the industry, I have seen AI tools reduce editing time by, like, 70% or even more.", isKeyPoint: true, fillerWords: ['like'] },
  { id: 't6', time: "25:30", speaker: "Host 1", text: "Wow, that is a significant number! We should probably explore that further.", isKeyPoint: false, fillerWords: [] },
];

export default function ReviewPage() {
  // UI State
  const [activeEditTab, setActiveEditTab] = useState<EditPanelTab>('ai-suggestions');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [commandInputValue, setCommandInputValue] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [editMode, setEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(21); // Percentage
  const [volume, setVolume] = useState(80);
  const [currentAiSuggestions, setCurrentAiSuggestions] = useState(aiSuggestions); // For contextual suggestions
  const [hoveredTranscriptId, setHoveredTranscriptId] = useState<string | null>(null);
  
  // New State for Timestamp Reference System
  const [showTimestampDropdown, setShowTimestampDropdown] = useState(false);
  const [commandInputPosition, setCommandInputPosition] = useState(0);
  const [filteredTimestamps, setFilteredTimestamps] = useState<{id: string; display: string; time: string; desc: string}[]>([]);
  const commandInputRef = useRef<HTMLInputElement>(null);
  
  // === New/Modified State for Pill Input ===
  // Updated type for activePill and items in filteredSuggestions
  type SuggestionType = 
    | 'segment' 
    | 'transcript' 
    | 'aiSuggestion' 
    | 'speaker'
    | 'graphic'       // New
    | 'onScreenText'  // New
    | 'object'        // New
    | 'scene'         // New
    | 'marker';       // New

  interface Suggestion {
    id: string;
    display: string;
    time?: string; 
    desc: string;
    type: SuggestionType;
    name?: string; 
    rawText?: string; // For onScreenText, to differentiate display (e.g. truncated) from full text
    imageUrl?: string; // For graphics, objects, scenes for potential preview
  }
  const [activePill, setActivePill] = useState<Suggestion | null>(null);
  const [commandActionText, setCommandActionText] = useState(''); 
  const [dropdownAtPosition, setDropdownAtPosition] = useState(0); 
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]); // Renamed from filteredTimestamps
  const [activeSuggestionCategoryFilter, setActiveSuggestionCategoryFilter] = useState<SuggestionType | 'all'>('all'); // New state for quick filters
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null); // New state for simulation feedback
  
  // Updated History State
  interface HistoryItem {
    id: string;
    result: string;
    command: string;
    timestamp: number;
    undone?: boolean;
  }
  const [commandHistory, setCommandHistory] = useState<HistoryItem[]>([]); 
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false); 

  // commandInputValue is now effectively managed by commandActionText and activePill
  // Replace currentAiSuggestions with a more general name if it's used for more than just AI suggestions in dropdown
  // End New/Modified State
  
  // State for Captions Tab
  const [captionLines, setCaptionLines] = useState(initialTranscriptData.map(line => ({ ...line, style: 'default', show: true, speaker: line.speaker || 'Unknown' })));
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState('default');
  const [captionPreviewText, setCaptionPreviewText] = useState("Animated Caption Preview");
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionSearchTerm, setCaptionSearchTerm] = useState('');
  const [captionSpeakerFilter, setCaptionSpeakerFilter] = useState('all');
  
  // State for Audio Tab
  const [masterVolume, setMasterVolume] = useState(80);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([
    { id: 'main-audio', name: 'Voice Track (Main)', volume: 90, isMuted: false, sourceType: 'main', effects: ['noise-reduction'] },
    { id: 'music-bg', name: 'Background Music', volume: 30, isMuted: false, sourceType: 'music', sourceFile: 'uplifting_theme.mp3', effects: [] },
  ]);
  const [selectedAudioTrackId, setSelectedAudioTrackId] = useState<string | null>('main-audio');
  const [showEffectsPanelForTrack, setShowEffectsPanelForTrack] = useState<string | null>(null);
  const [aiSoundSuggestions, setAiSoundSuggestions] = useState<AiSoundSuggestion[]>([
    { id: 'sugg1', description: "Suggest adding subtle 'whoosh' for topic transition at 13:30", timeCue: "13:30", category: 'sfx', icon: 'ri-windy-line', soundPreviewUrl: '/sfx/whoosh.mp3' },
    { id: 'sugg2', description: "Consider a short, optimistic musical sting for the 'Future Trends' intro at 38:30", timeCue: "38:30", category: 'music-sting', icon: 'ri-music-2-line', soundPreviewUrl: '/sfx/sting.mp3' },
    { id: 'sugg3', description: "Applause sound effect could enhance the conclusion of the interview at 38:00", timeCue: "38:00", category: 'sfx', icon: 'ri-thumb-up-line', soundPreviewUrl: '/sfx/applause.mp3' },
  ]);
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  
  // State for Visual Tab
  const [appliedVisualEffects, setAppliedVisualEffects] = useState<VisualEffect[]>([
    { id: 'filter-vintage', name: 'Vintage Film Filter', type: 'filter', isEnabled: true, properties: { filterPreset: 'vintage-02', intensity: 0.6 } },
    { id: 'cc-main', name: 'Primary Color Correction', type: 'color-correction', isEnabled: true, properties: { brightness: 0.05, contrast: 0.1, saturation: 0.02, temperature: 10, tint: -5 } },
    { id: 'overlay-lightleak', name: 'Light Leak Overlay', type: 'overlay', isEnabled: false, properties: { overlayUrl: '/overlays/light_leak_01.png', opacity: 0.4, blendMode: 'screen', scale: 1, rotation: 0} },
  ]);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);
  const [aiVisualSuggestions, setAiVisualSuggestions] = useState<AiVisualSuggestion[]>([
    { 
      id: 'vis-sugg1', 
      description: "Auto-enhance lighting for Host 1 during intro", 
      timeCue: "0:10-0:45", 
      effectType: 'lighting', 
      icon: 'ri-sun-line', 
      previewImageUrl: 'https://readdy.ai/api/search-image?query=podcast%20host%20face%20lighting%20enhancement%20before%20after&width=160&height=90&seq=12&orientation=landscape', 
      details: { brightnessTarget: 0.15, contrastTarget: 0.05, targetArea: 'face-host1' }
    },
    { 
      id: 'vis-sugg2', 
      description: "Apply 'Cinematic Bloom' filter to interview segment", 
      timeCue: "25:15-38:30", 
      effectType: 'filter', 
      icon: 'ri-sparkling-2-line', 
      details: { filterPresetToApply: 'cinematic-bloom', intensity: 0.3 }
    },
    { 
      id: 'vis-sugg3', 
      description: "Improve framing for Host 2 at 15:20 (auto-crop & reframe)", 
      timeCue: "15:20", 
      effectType: 'framing', 
      icon: 'ri-crop-line', 
      details: { cropRect: { top: 0.05, right: 0.05, bottom: 0.05, left: 0.05 }, zoomFactor: 1.1 }
    },
    {
      id: 'vis-sugg4',
      description: "Stabilize shaky footage during outdoor segment (placeholder)",
      timeCue: "40:00-42:00",
      effectType: 'stabilization',
      icon: 'ri-focus-3-line',
      details: { stabilizationLevel: 'medium' }
    }
  ]);
  const [showFilterGallery, setShowFilterGallery] = useState(false);
  const [showOverlayLibrary, setShowOverlayLibrary] = useState(false);

  // State for B-Roll Tab
  const [projectBRollClips, setProjectBRollClips] = useState<BRollClip[]>([
    { id: 'broll1', name: 'Tech Visualization Montage', videoUrl: '/broll/tech_viz.mp4', thumbnailUrl: 'https://readdy.ai/api/search-image?query=digital%20technology%20visualization%2C%20abstract%20AI%20concept%2C%20blue%20tones&width=160&height=90&seq=11&orientation=landscape', source: 'project-asset', duration: 15, startTimeInMainVideo: 930 }, // 15:30
  ]);
  const [aiBRollSuggestions, setAiBRollSuggestions] = useState<AiBRollSuggestion[]>([
    {
      id: 'broll-sugg1',
      description: "Suggest B-roll for 'AI Basics' discussion (approx 5:00-10:00)",
      keywords: ['artificial intelligence', 'machine learning', 'neural network', 'abstract tech'],
      timeCue: "5:00-10:00",
      icon: 'ri-lightbulb-flash-line',
      suggestedClips: [
        { name: 'Abstract Neural Network', thumbnailUrl: 'https://readdy.ai/api/search-image?query=abstract%20neural%20network%20animation&width=160&height=90&seq=20&orientation=landscape', videoUrl: '/library/abstract_nn.mp4', duration: 10 },
        { name: 'Coding on Screen Close-up', thumbnailUrl: 'https://readdy.ai/api/search-image?query=coding%20on%20screen%20close%20up&width=160&height=90&seq=21&orientation=landscape', videoUrl: '/library/coding_closeup.mp4', duration: 8 },
      ]
    },
    {
      id: 'broll-sugg2',
      description: "Show diverse group collaborating for 'Content Creation' segment",
      keywords: ['teamwork', 'collaboration', 'creative process', 'diverse group'],
      timeCue: "13:30-25:15",
      icon: 'ri-team-line',
      suggestedClips: [
        { name: 'Diverse Team Brainstorming', thumbnailUrl: 'https://readdy.ai/api/search-image?query=diverse%20team%20brainstorming%20office&width=160&height=90&seq=22&orientation=landscape', videoUrl: '/library/team_brainstorm.mp4', duration: 12 },
      ]
    },
  ]);
  const [showBRollLibrary, setShowBRollLibrary] = useState(false);
  const [selectedBRollSuggestionKeywords, setSelectedBRollSuggestionKeywords] = useState<string[]>([]);

  // State for B-Roll Library Modal
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [libraryFilters, setLibraryFilters] = useState<{ category: string; duration: string; orientation: string }>({ category: 'all', duration: 'any', orientation: 'any' });
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedLibraryClip, setSelectedLibraryClip] = useState<LibraryBRollClip | null>(null);
  // Simulated master list of library clips
  const [masterLibraryClips, setMasterLibraryClips] = useState<LibraryBRollClip[]>([
    { id: 'lib-c1', name: 'Abstract Neural Network Loop', videoUrl: '/library/abstract_nn.mp4', thumbnailUrl: 'https://readdy.ai/api/search-image?query=abstract%20neural%20network%20animation&width=160&height=90&seq=20&orientation=landscape', source: 'ai-library', duration: 12, tags: ['tech', 'ai', 'abstract', 'loop'], mood: ['futuristic', 'complex'], resolution: '1080p', orientation: 'landscape', description: 'A mesmerizing loop of an abstract neural network visualization.', license: 'Royalty-Free' },
    { id: 'lib-c2', name: 'Coding on Screen', videoUrl: '/library/coding_closeup.mp4', thumbnailUrl: 'https://readdy.ai/api/search-image?query=coding%20on%20screen%20close%20up&width=160&height=90&seq=21&orientation=landscape', source: 'ai-library', duration: 8, tags: ['tech', 'programming', 'code', 'computer'], mood: ['focused', 'modern'], resolution: '1080p', orientation: 'landscape', description: 'Close-up shot of code being written on a screen.', license: 'Royalty-Free' },
    { id: 'lib-c3', name: 'Diverse Team Brainstorming Session', videoUrl: '/library/team_brainstorm.mp4', thumbnailUrl: 'https://readdy.ai/api/search-image?query=diverse%20team%20brainstorming%20office&width=160&height=90&seq=22&orientation=landscape', source: 'ai-library', duration: 15, tags: ['business', 'team', 'collaboration', 'office', 'people'], mood: ['positive', 'energetic'], resolution: '4K', orientation: 'landscape', description: 'A diverse group of professionals brainstorming in a modern office.', license: 'Royalty-Free' },
    { id: 'lib-c4', name: 'Drone Shot of Mountains', videoUrl: '/library/mountains_drone.mp4', thumbnailUrl: 'https://readdy.ai/api/search-image?query=drone%20shot%20mountains&width=160&height=90&seq=23&orientation=landscape', source: 'ai-library', duration: 20, tags: ['nature', 'landscape', 'mountains', 'aerial', 'travel'], mood: ['epic', 'calm'], resolution: '4K', orientation: 'landscape', description: 'Breathtaking aerial footage of majestic mountains.', license: 'Royalty-Free' },
    { id: 'lib-c5', name: 'City Traffic Timelapse', videoUrl: '/library/city_traffic_timelapse.mp4', thumbnailUrl: 'https://readdy.ai/api/search-image?query=city%20traffic%20timelapse&width=160&height=90&seq=24&orientation=landscape', source: 'ai-library', duration: 10, tags: ['city', 'urban', 'timelapse', 'cars', 'transport'], mood: ['busy', 'dynamic'], resolution: '1080p', orientation: 'landscape', description: 'A fast-paced timelapse of city traffic at night.', license: 'Royalty-Free' },
    { id: 'lib-c6', name: 'Person Typing on Laptop (Portrait)', videoUrl: '/library/typing_portrait.mp4', thumbnailUrl: 'https://readdy.ai/api/search-image?query=person%20typing%20laptop%20portrait&width=90&height=160&seq=26&orientation=portrait', source: 'ai-library', duration: 7, tags: ['work', 'laptop', 'typing', 'remote'], mood: ['neutral'], resolution: '1080p', orientation: 'portrait', description: 'Vertical shot of hands typing on a laptop.', license: 'Royalty-Free' }
  ]);
  const [filteredLibraryClips, setFilteredLibraryClips] = useState<LibraryBRollClip[]>([]);

  // State for Thumbnail Generator Tab
  const [mainThumbnail, setMainThumbnail] = useState({
    id: 'main-thumb-1',
    src: 'https://readdy.ai/api/search-image?query=excited%20host%20pointing%20at%20futuristic%20AI%20visualization%2C%20dramatic%20lighting%2C%20cutout%20person%20composited%20onto%20tech%20background%2C%20YouTube%20thumbnail%20style%2C%20high%20energy%20expression%2C%20professional%20quality&width=600&height=338&seq=13&orientation=landscape',
    title: 'AI REVOLUTION IN CONTENT CREATION',
    brightness: 50,
    contrast: 50,
    titleStyle: { // Added titleStyle
      textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)',
      fontFamily: 'Inter, sans-serif', // Default font family
      // other style properties like fontWeight, fontStyle, textTransform can be added here by font styles
    } as React.CSSProperties, // Type assertion
  });
  const [alternativeThumbnails, setAlternativeThumbnails] = useState([
    { id: 'alt-thumb-1', src: 'https://readdy.ai/api/search-image?query=podcast%20hosts%20engaged%20in%20animated%20discussion%2C%20close%20up%20shot%2C%20professional%20lighting%2C%20dynamic%20composition&width=200&height=113&seq=14&orientation=landscape' },
    { id: 'alt-thumb-2', src: 'https://readdy.ai/api/search-image?query=technology%20visualization%20with%20podcast%20hosts%20in%20background%2C%20modern%20studio%20setup%2C%20professional%20equipment&width=200&height=113&seq=15&orientation=landscape' },
    { id: 'alt-thumb-3', src: 'https://readdy.ai/api/search-image?query=podcast%20studio%20environment%20with%20AI%20visualization%20overlay%2C%20professional%20lighting%2C%20engaging%20composition&width=200&height=113&seq=16&orientation=landscape' },
  ]);
  const [selectedTextEffect, setSelectedTextEffect] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [showTitleStyleEditor, setShowTitleStyleEditor] = useState(false);

  // State for making title editable
  const [isEditingThumbnailTitle, setIsEditingThumbnailTitle] = useState(false);
  const [editableThumbnailTitle, setEditableThumbnailTitle] = useState(mainThumbnail.title);

  // State for Text Size/Position
  const [thumbnailTitleSize, setThumbnailTitleSize] = useState(1.5); // Default to 1.5rem
  const [thumbnailTitleAlign, setThumbnailTitleAlign] = useState('center'); // 'left', 'center', 'right'
  const [thumbnailTitlePosition, setThumbnailTitlePosition] = useState({ x: 50, y: 50 }); // For X, Y positioning

  // State for collapsible sections
  const [textStylingCollapsed, setTextStylingCollapsed] = useState(false); // Default open
  const [textEffectsCollapsed, setTextEffectsCollapsed] = useState(false);   // Default open
  const [layoutCollapsed, setLayoutCollapsed] = useState(true);           // MODIFIED: Default collapsed
  const [stickersSectionCollapsed, setStickersSectionCollapsed] = useState(true); // MODIFIED: Default collapsed
  const [imageAdjustmentsCollapsed, setImageAdjustmentsCollapsed] = useState(true); // ENSURE this is present and default collapsed

  // Type for Active Stickers
  interface ActiveSticker {
    id: string;
    alt: string;
    src: string;
    x: number; // percentage
    y: number; // percentage
    scale: number;
    rotation: number;
  }
  const [activeStickers, setActiveStickers] = useState<ActiveSticker[]>([]); 

  // State for Dragging Stickers
  const [draggingSticker, setDraggingSticker] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const thumbnailPreviewRef = useRef<HTMLDivElement>(null); // Ref for the thumbnail preview area to calculate relative drag positions

  // Sample data for Thumbnail Editor Panel - FONT STYLES (Re-adding this)
  const sampleFontStyles = [
    { name: 'Impactful', style: { fontFamily: 'Impact, Haettenschweiler, \'Arial Narrow Bold\', sans-serif', textTransform: 'uppercase', WebkitTextStroke: '1px black', paintOrder: 'stroke fill' } },
    { name: 'Dynamic Bold', style: { fontWeight: 'bold', fontStyle: 'italic' } },
    { name: 'Modern Sans', style: { fontFamily: 'Inter, sans-serif', fontWeight: '600' } },
    { name: 'Shadowed', style: { textShadow: '2px 2px 4px rgba(0,0,0,0.6)' } },
  ];

  // Define some text effects - TEXT EFFECTS
  const thumbnailTextEffects: Record<string, React.CSSProperties> = {
    None: { 
      textShadow: mainThumbnail.titleStyle.textShadow || '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)', // Fallback to original complex shadow
      backgroundImage: 'none',
      WebkitBackgroundClip: 'unset',
      backgroundClip: 'unset',
      WebkitTextFillColor: 'unset',
      WebkitTextStroke: 'unset', // Explicitly clear stroke
      paintOrder: 'fill', // Reset paint order
      color: 'white', // Reset color to default
    },
    Outline: {
      WebkitTextStroke: '1.5px white', // White outline
      paintOrder: 'stroke fill',
      color: mainThumbnail.titleStyle.color || '#6366f1', // Use existing text color or a vibrant default for contrast with white outline
      textShadow: '1px 1px 2px rgba(0,0,0,0.7)', // Subtle shadow to lift the outlined text
    },
    Glow: { 
      textShadow: '0 0 3px #FFF, 0 0 6px #FFF, 0 0 9px #6366f1, 0 0 12px #6366f1', // Refined glow
      color: 'white', // Text color for glow
    },
    Shadow: { 
      textShadow: '2px 2px 0px #333, 4px 4px 0px #555, 6px 6px 8px rgba(0,0,0,0.5)', // More layered drop shadow
      color: 'white',
    },
    Gradient: { 
      backgroundImage: 'linear-gradient(45deg, #f87171, #a855f7, #6366f1)', // More vibrant gradient
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '1px 1px 1px rgba(0,0,0,0.2)', 
    },
    '3D': { 
      textShadow: '1px 1px #bbb, 2px 2px #bbb, 3px 3px #999, 4px 4px #777, 5px 5px 3px rgba(0,0,0,0.4)', // Softer, more layered 3D
      color: 'white',
    },
    Neon: { 
      color: '#fef08a', // Light yellow text
      textShadow: '0 0 2px #fff, 0 0 5px #fef08a, 0 0 10px #facc15, 0 0 15px #eab308, 0 0 20px #ca8a04', // Yellow/gold neon
    }
  };

  const sampleTrendingTitles = [
    "*SHOCKING* AI Changes Everything!",
    "AI Secrets REVEALED!",
    "This AI Tool Changes EVERYTHING",
    "The FUTURE of Content is HERE",
  ];

  const sampleStickers = [
    { id: 'sticker1', alt: 'Excited person', src: 'https://readdy.ai/api/search-image?query=excited%20person%20pointing%20upward%2C%20cutout%20style%2C%20transparent%20background%2C%20dramatic%20expression&width=100&height=100&seq=20&orientation=squarish' },
    { id: 'sticker2', alt: 'Shocked face', src: 'https://readdy.ai/api/search-image?query=shocked%20face%20with%20hands%20on%20cheeks%2C%20cutout%20style%2C%20transparent%20background%2C%20dramatic%20reaction&width=100&height=100&seq=21&orientation=squarish' },
    { id: 'sticker3', alt: 'Arrow effect', src: 'https://readdy.ai/api/search-image?query=arrow%20pointing%20effect%2C%20neon%20style%2C%20transparent%20background&width=100&height=100&seq=22&orientation=squarish' },
    { id: 'sticker4', alt: 'Explosion effect', src: 'https://readdy.ai/api/search-image?query=explosion%20effect%20sticker%2C%20comic%20style%2C%20transparent%20background&width=100&height=100&seq=23&orientation=squarish' },
  ];

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Placeholder for missing function
  const handleSourceAssetClick = (sourceId: string) => {
    console.log('Source asset clicked:', sourceId);
    // Placeholder logic: maybe select the source, show details, etc.
  };
  
  // Handle play/pause
  const handlePlayPause = () => {
    setIsVideoPlaying(!isVideoPlaying);
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };
  
  // Toggle annotations
  const handleToggleAnnotations = () => setShowAnnotations(!showAnnotations);
  
  // Command input
  const handleCommandInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommandActionText(value); 

    const lastAtSymbolIndex = value.lastIndexOf('@');
    if (lastAtSymbolIndex !== -1 && (!activePill || value.length > lastAtSymbolIndex +1)) { 
      setShowTimestampDropdown(true);
      setDropdownAtPosition(lastAtSymbolIndex);
      
      const fullQueryAfterAt = value.slice(lastAtSymbolIndex + 1);
      let suggestionCategory: SuggestionType | 'all' = 'all';
      let searchTerm = fullQueryAfterAt.toLowerCase().trim();

      // Check for specific category prefixes like "@speaker:"
      if (fullQueryAfterAt.startsWith('speaker:')) {
        suggestionCategory = 'speaker';
        searchTerm = fullQueryAfterAt.substring('speaker:'.length).toLowerCase().trim();
      } else if (fullQueryAfterAt.startsWith('graphic:')) {
        suggestionCategory = 'graphic';
        searchTerm = fullQueryAfterAt.substring('graphic:'.length).toLowerCase().trim();
      } else if (fullQueryAfterAt.startsWith('text:')) {
        suggestionCategory = 'onScreenText';
        searchTerm = fullQueryAfterAt.substring('text:'.length).toLowerCase().trim();
      } else if (fullQueryAfterAt.startsWith('object:')) {
        suggestionCategory = 'object';
        searchTerm = fullQueryAfterAt.substring('object:'.length).toLowerCase().trim();
      } else if (fullQueryAfterAt.startsWith('scene:')) {
        suggestionCategory = 'scene';
        searchTerm = fullQueryAfterAt.substring('scene:'.length).toLowerCase().trim();
      } else if (fullQueryAfterAt.startsWith('marker:')) {
        suggestionCategory = 'marker';
        searchTerm = fullQueryAfterAt.substring('marker:'.length).toLowerCase().trim();
      }
      
      const allSuggestions: Suggestion[] = [
        // Add segments as timestamps
        ...timelineSegments.map(segment => ({
          id: `segment-${segment.id}`,
          display: segment.title,
          time: segment.startTime,
          desc: `${segment.title} segment (${segment.startTime}-${segment.endTime})`,
          type: 'segment' as SuggestionType,
        })),
        // Add key points from transcript
        ...initialTranscriptData
          .filter(item => item.isKeyPoint)
          .map(item => ({
            id: `transcript-${item.id}`,
            display: item.text.length > 30 ? item.text.substring(0, 30) + '...' : item.text,
            time: item.time,
            desc: `${item.speaker}: "${item.text.substring(0, 40)}${item.text.length > 40 ? '...' : ''}"`,
            type: 'transcript' as SuggestionType,
          })),
        // Add AI suggestions as timestamps
        ...aiSuggestions.map(sugg => ({
          id: `suggestion-${sugg.id}`,
          display: sugg.title,
          time: sugg.time.split(' - ')[0],
          desc: sugg.desc,
          type: 'aiSuggestion' as SuggestionType,
        })),
        // Add unique speakers
        ...Array.from(new Set(initialTranscriptData.map(item => item.speaker)))
          .filter(speaker => speaker) // Filter out undefined/empty speaker names
          .map(speaker => ({
            id: `speaker-${speaker.replace(/\s+/g, '-')}`,
            display: speaker,
            desc: `Reference speaker: ${speaker}`,
            type: 'speaker' as SuggestionType,
            name: speaker, // Store the original speaker name
          })),
        // Add new suggestion types
        ...sampleGraphics,
        ...sampleOnScreenTexts,
        ...sampleDetectedObjects,
        ...sampleDetectedScenes,
        ...sampleUserMarkers,
      ];
      
      let tempFiltered = allSuggestions;

      // 1. Apply category prefix from input (e.g., @speaker:)
      if (suggestionCategory !== 'all') {
        tempFiltered = tempFiltered.filter(s => s.type === suggestionCategory);
      }
      // 2. Else, if an active quick filter is set (and not from direct prefix typing), apply it
      else if (activeSuggestionCategoryFilter !== 'all') {
        if (activeSuggestionCategoryFilter === 'segment') { // Special case for a "Time" filter if we make one
          tempFiltered = tempFiltered.filter(s => s.type === 'segment' || s.type === 'transcript' || s.type === 'aiSuggestion' || s.type === 'marker');
        } else {
          tempFiltered = tempFiltered.filter(s => s.type === activeSuggestionCategoryFilter);
        }
      }

      // 3. Apply search term to the (potentially) category-filtered list
      if (searchTerm) {
        tempFiltered = tempFiltered.filter(s => 
            s.display.toLowerCase().includes(searchTerm) || 
            s.desc.toLowerCase().includes(searchTerm) ||
            (s.time && s.time.includes(searchTerm)) ||
            (s.name && s.name.toLowerCase().includes(searchTerm))
          );
      } 
      // If no search term AND no prefix category, the list is already filtered by activeSuggestionCategoryFilter or is 'all'
      
      setFilteredSuggestions(tempFiltered);
    } else {
      setShowTimestampDropdown(false);
      // Reset quick filter when dropdown closes to avoid it being stuck
      // setActiveSuggestionCategoryFilter('all'); // Optional: Decide if filter should reset or persist
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => { // Renamed from handleTimestampSelect
    const textBeforeAt = commandActionText.substring(0, dropdownAtPosition);
    // Regex to remove @mention, including optional type prefix like @speaker:
    const textAfterAtMention = commandActionText.substring(dropdownAtPosition).replace(/^@[\w-]+:?[^\\s]*/, '').trimStart();
    
    setCommandActionText(textBeforeAt + textAfterAtMention); 
    setActivePill(suggestion);
    setShowTimestampDropdown(false);
    
    if (commandInputRef.current) {
      commandInputRef.current.focus();
      setTimeout(() => {
        if (commandInputRef.current) {
          const endPos = commandActionText.length; // This might need adjustment if textAfterAtMention is empty
          commandInputRef.current.setSelectionRange(endPos, endPos);
        }
      },0);
    }
  };

  // Handle Shorten This Part button click
  const handleShortenThisPart = () => {
    setActivePill(null);
    setCommandActionText("Shorten @"); 
    
    const atPos = "Shorten ".length;
    setDropdownAtPosition(atPos);
    setShowTimestampDropdown(true);
    
    // Simplified: Re-use existing suggestion generation logic for initial population
    const allSuggestions: Suggestion[] = [
      ...timelineSegments.map(segment => ({
        id: `segment-${segment.id}`,
        display: segment.title,
        time: segment.startTime,
        desc: `${segment.title} segment (${segment.startTime}-${segment.endTime})`,
        type: 'segment' as SuggestionType,
      })),
      ...initialTranscriptData
        .filter(item => item.isKeyPoint)
        .map(item => ({
          id: `transcript-${item.id}`,
          display: item.text.length > 30 ? item.text.substring(0, 30) + '...' : item.text,
          time: item.time,
          desc: `${item.speaker}: "${item.text.substring(0, 40)}${item.text.length > 40 ? '...' : ''}"`,
          type: 'transcript' as SuggestionType,
        })),
      ...aiSuggestions.map(sugg => ({
        id: `suggestion-${sugg.id}`,
        display: sugg.title,
        time: sugg.time.split(' - ')[0], 
        desc: sugg.desc,
        type: 'aiSuggestion' as SuggestionType,
      }))
      // Speakers could also be added here if desired for the initial "Shorten @" click
    ];
    setFilteredSuggestions(allSuggestions); 
    
    if (commandInputRef.current) {
      commandInputRef.current.focus();
      setTimeout(() => commandInputRef.current?.setSelectionRange(atPos + 1, atPos + 1), 0);
    }
  };

  const handleDismissPill = () => {
    setActivePill(null);
    if (commandInputRef.current) {
      commandInputRef.current.focus();
    }
  };
  
  const handleCommandSubmit = () => {
    let finalCommand = commandActionText.trim();
    let commandAction = commandActionText.trim().toLowerCase();
    const currentPill = activePill; // Capture activePill at submission time

    if (currentPill) {
      const pillText = currentPill.type === 'speaker' 
        ? `@speaker:${currentPill.display}` 
        : currentPill.type === 'graphic'
        ? `@graphic:${currentPill.display}`
        : currentPill.type === 'onScreenText'
        ? `@text:${currentPill.display}` 
        : currentPill.type === 'object'
        ? `@object:${currentPill.display}`
        : currentPill.type === 'scene'
        ? `@scene:${currentPill.display}`
        : currentPill.type === 'marker'
        ? `@marker:${currentPill.display}`
        : `@${currentPill.time} (${currentPill.display})`; 
      finalCommand = commandActionText.trim() ? `${commandActionText.trim()} ${pillText}` : pillText;
      // If the action text itself is empty, infer a default action based on pill type?
      if (!commandAction && currentPill.type !== 'speaker') { // Example: If just a timestamp/segment pill is submitted
          commandAction = 'seek to'; // Default action could be seeking
          finalCommand = `Seek to ${pillText}`;
      }
    }

    if (!finalCommand) return; 

    console.log('Processing command:', finalCommand);
    setSimulationStatus(`Processing: "${finalCommand}"...`); // Show initial processing message
    
    // Clear fields immediately
    setCommandActionText("");
    setActivePill(null);
    setShowTimestampDropdown(false); 
    setActiveSuggestionCategoryFilter('all'); // Reset filter on submit
    
    // --- Simulation Logic --- 
    setTimeout(() => {
      let simulationResult = `Processed: "${finalCommand}"`; // Default success message
      
      // Simple parsing based on keywords and pill type
      if (currentPill) {
        switch (currentPill.type) {
          case 'segment':
          case 'transcript':
          case 'aiSuggestion':
          case 'marker':
            if (commandAction.includes('shorten') || commandAction.includes('trim') || commandAction.includes('cut')) {
              simulationResult = `SIMULATED: Shortening clip around ${currentPill.time} (${currentPill.display})`;
              // In real app: videoEngine.trim(currentPill.time, ...);
            } else if (commandAction.includes('seek') || commandAction.includes('go to')) {
              simulationResult = `SIMULATED: Seeking video to ${currentPill.time} (${currentPill.display})`;
              // In real app: videoRef.current.currentTime = timeToSeconds(currentPill.time);
            } else if (commandAction.includes('add music')) {
              simulationResult = `SIMULATED: Adding music starting near ${currentPill.time} (${currentPill.display})`;
            }
            break;
          case 'speaker':
            if (commandAction.includes('louder') || commandAction.includes('increase volume')) {
              simulationResult = `SIMULATED: Increasing volume for speaker ${currentPill.display}.`;
            } else if (commandAction.includes('quieter') || commandAction.includes('decrease volume')) {
              simulationResult = `SIMULATED: Decreasing volume for speaker ${currentPill.display}.`;
            }
            break;
          case 'graphic':
            if (commandAction.includes('bigger') || commandAction.includes('enlarge')) {
              simulationResult = `SIMULATED: Making graphic '${currentPill.display}' larger.`;
            } else if (commandAction.includes('smaller') || commandAction.includes('reduce')) {
              simulationResult = `SIMULATED: Making graphic '${currentPill.display}' smaller.`;
            } else if (commandAction.includes('hide') || commandAction.includes('remove')) {
              simulationResult = `SIMULATED: Hiding graphic '${currentPill.display}'.`;
            }
            break;
          case 'onScreenText':
             if (commandAction.includes('animate')) {
              simulationResult = `SIMULATED: Animating on-screen text '${currentPill.display}'.`;
            } else if (commandAction.includes('change font')) {
              simulationResult = `SIMULATED: Changing font for on-screen text '${currentPill.display}'.`;
            }
            break;
          case 'object':
            if (commandAction.includes('blur background')) {
              simulationResult = `SIMULATED: Blurring background around object '${currentPill.display}'.`;
            } else if (commandAction.includes('highlight') || commandAction.includes('focus on')) {
               simulationResult = `SIMULATED: Highlighting object '${currentPill.display}'.`;
            }
            break;
           case 'scene':
            if (commandAction.includes('brighter') || commandAction.includes('increase brightness')) {
              simulationResult = `SIMULATED: Increasing brightness for scene '${currentPill.display}'.`;
            } else if (commandAction.includes('color grade') || commandAction.includes('change look')) {
               simulationResult = `SIMULATED: Applying color grade to scene '${currentPill.display}'.`;
            }
            break;
          // Marker simulation handled within the time-based block above if action is trim/seek etc.
        }
      } else {
        // Handle commands without pills (e.g., "summarize video", "export")
        if (commandAction.includes('summarize')) {
           simulationResult = `SIMULATED: Generating video summary...`;
        } else if (commandAction.includes('export')) {
           simulationResult = `SIMULATED: Starting video export process...`;
           handleExport(); // Call existing export function if needed
        }
      }

      console.log(simulationResult);
      setSimulationStatus(simulationResult); // Update status with result
      
      // Update Command History with more details
      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`,
        result: simulationResult,
        command: finalCommand,
        timestamp: Date.now(),
        undone: false,
      };
      setCommandHistory(prevHistory => [newHistoryItem, ...prevHistory.slice(0, 19)]); 

      // Clear the status message after a few seconds
      setTimeout(() => setSimulationStatus(null), 4000);

    }, 1500); // Simulate processing delay
  };
  
  // New function to handle simulated undo
  const handleUndoAction = (historyItemId: string) => {
    const itemToUndo = commandHistory.find(item => item.id === historyItemId);
    if (!itemToUndo || itemToUndo.undone) return; // Do nothing if not found or already undone

    console.log(`SIMULATED: Undoing action: '${itemToUndo.result}' (Command: '${itemToUndo.command}')`);
    setSimulationStatus(`Simulating: Undoing '${itemToUndo.result.replace('SIMULATED: ', '')}'...`);

    // Mark the item as undone in the history state
    setCommandHistory(prevHistory => 
      prevHistory.map(item => 
        item.id === historyItemId ? { ...item, undone: true } : item
      )
    );

    // Clear the simulation status after a delay
    setTimeout(() => setSimulationStatus(null), 3000);
  };
  
  // Tab navigation
  const handleTabClick = (tab: EditPanelTab) => {
    setActiveEditTab(tab);
  };
  
  // Toggle edit mode
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  // Apply AI suggestion
  const handleAiSuggestionApply = (suggestionId: number) => {
    console.log('Applying AI Suggestion:', suggestionId);
    // Here you would apply the effect and update UI
  };
  
  // Timeline segment click
  const handleTimelineSegmentClick = (segmentId: string) => {
    const newSelectedSegment = segmentId === selectedSegment ? null : segmentId;
    setSelectedSegment(newSelectedSegment);
    
    if (!editMode && newSelectedSegment) { // Open edit panel if not already open and a segment is selected
      setEditMode(true);
    }

    if (newSelectedSegment) {
      // Filter/fetch suggestions for the selected segment
      // For simulation, filter existing suggestions. In real app, might fetch or have more complex logic.
      const segmentSpecificSuggestions = aiSuggestions.filter(sugg => 
        (segmentId === 'intro' && sugg.id === 1) || 
        (segmentId === 'content-creation' && sugg.id === 2) ||
        (segmentId === 'future-trends' && sugg.id === 3) ||
        sugg.id > 3 // Show some generic ones too for other segments
      ).slice(0, 3); // Limit for demo
      setCurrentAiSuggestions(segmentSpecificSuggestions.length > 0 ? segmentSpecificSuggestions : aiSuggestions.slice(0,2)); // Fallback to generic if none specific
      setActiveEditTab('ai-suggestions'); // Switch to AI suggestions tab
    } else {
      // Show suggestions for the whole video
      setCurrentAiSuggestions(aiSuggestions);
    }

    const segment = timelineSegments.find(s => s.id === segmentId);
    if (segment) {
      console.log(`Seeking to ${segment.startTime}`);
      // Here you would seek the video
    }
  };

  // Handle clicking "All Video" or segment pills in the editor
  const handleEditorSegmentNavigation = (segmentId: string | null) => {
    setSelectedSegment(segmentId);
    if (segmentId) {
      const segmentSpecificSuggestions = aiSuggestions.filter(sugg => 
        (segmentId === 'intro' && sugg.id === 1) || 
        (segmentId === 'content-creation' && sugg.id === 2) ||
        (segmentId === 'future-trends' && sugg.id === 3) ||
        sugg.id > 3
      ).slice(0, 3);
      setCurrentAiSuggestions(segmentSpecificSuggestions.length > 0 ? segmentSpecificSuggestions : aiSuggestions.slice(0,2));
    } else {
      setCurrentAiSuggestions(aiSuggestions); // Show all suggestions
    }
    setActiveEditTab('ai-suggestions');
  };
  
  // Timeline zoom
  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 0.5, 0.5));
  
  // Handle source filtering
  const handleSourceFilterChange = (filter: SourceFilter) => {
    setSourceFilter(filter);
  };
  
  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    // Here you would implement actual fullscreen API
  };
  
  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };
  
  // Export, save, generate short clips
  const handleExport = () => console.log('Exporting video...');
  const handleSaveDraft = () => console.log('Saving draft...');
  const handleGenerateShortClips = () => console.log('Generating short clips...');
  
  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Caption specific handlers
  const handleCaptionTextChange = (id: string, newText: string) => {
    setCaptionLines(prev => prev.map(line => line.id === id ? { ...line, text: newText } : line));
  };

  const handleCaptionStyleChange = (style: string) => {
    setSelectedCaptionStyle(style);
    // Optionally apply to selected caption line or all lines
  };

  const applyStyleToCaptionLine = (id: string, style: string) => {
    setCaptionLines(prev => prev.map(line => line.id === id ? { ...line, style: style } : line));
  };
  
  const handleToggleCaptionVisibility = (id: string) => {
    setCaptionLines(prev => prev.map(line => line.id === id ? { ...line, show: !line.show } : line));
  };

  const handleAiCaptionCorrection = (id: string) => {
    console.log(`AI correcting caption for line ${id}`);
    // Simulate AI correction - in real app, this would involve backend AI
    setCaptionLines(prev => prev.map(line => {
      if (line.id === id) {
        // Example: Capitalize first letter, add punctuation if missing
        let correctedText = line.text.trim();
        if (correctedText.length > 0 && correctedText[0] !== correctedText[0].toUpperCase()) {
          correctedText = correctedText[0].toUpperCase() + correctedText.substring(1);
        }
        if (correctedText.length > 0 && !'.!?'.includes(correctedText[correctedText.length - 1])) {
          correctedText += '.';
        }
        return { ...line, text: correctedText };
      }
      return line;
    }));
    alert(`AI suggested corrections for caption: ${id}`);
  };

  const handleAiKeyPhraseEmphasis = (id: string) => {
    console.log(`AI emphasizing key phrases for caption ${id}`);
    // This would involve more complex AI to identify and style key phrases
    alert(`AI will analyze and suggest emphasis for key phrases in caption: ${id}`);
  };

  const getFilteredCaptionLines = () => {
    return captionLines.filter(line => 
      (captionSpeakerFilter === 'all' || line.speaker === captionSpeakerFilter) &&
      (captionSearchTerm === '' || line.text.toLowerCase().includes(captionSearchTerm.toLowerCase()))
    );
  };

  const uniqueCaptionSpeakers = ['all', ...new Set(captionLines.map(line => line.speaker || 'Unknown'))];

  const captionStyles = [
    { id: 'default', name: 'Default', previewClass: 'text-white text-2xl font-semibold' },
    { id: 'modern', name: 'Modern Bold', previewClass: 'text-white text-2xl font-bold tracking-wide uppercase' },
    { id: 'minimal', name: 'Minimalist', previewClass: 'text-slate-200 text-xl font-light' },
    { id: 'highlight', name: 'Highlight Yellow', previewClass: 'bg-yellow-400 text-black text-2xl font-bold px-2 py-1 rounded' },
    { id: 'cinematic', name: 'Cinematic Sub', previewClass: 'text-slate-300 text-lg font-sans tracking-wider' },
    { id: 'energetic', name: 'Energetic Pop', previewClass: 'text-fuchsia-400 text-3xl font-extrabold italic animate-pulse' }, // Example animation
  ];

  // Audio Tab Handlers
  const handleMasterVolumeChange = (newVolume: number) => {
    setMasterVolume(newVolume);
    // Logic to apply master volume to the audio engine
    console.log('Master volume changed to:', newVolume);
  };

  const handleTrackVolumeChange = (trackId: string, newVolume: number) => {
    setAudioTracks(prev => prev.map(track => track.id === trackId ? { ...track, volume: newVolume } : track));
    console.log(`Volume for track ${trackId} changed to:`, newVolume);
  };

  const toggleTrackMute = (trackId: string) => {
    setAudioTracks(prev => prev.map(track => track.id === trackId ? { ...track, isMuted: !track.isMuted } : track));
  };
  
  const handleAddMusicTrack = () => {
    const newTrackId = `music-${Date.now()}`;
    const newTrack: AudioTrack = {
      id: newTrackId,
      name: `New Music Track ${audioTracks.filter(t => t.sourceType === 'music').length + 1}`,
      volume: 50,
      isMuted: false,
      sourceType: 'music',
      effects: [],
      // sourceFile will be set when user selects from library
    };
    setAudioTracks(prev => [...prev, newTrack]);
    setSelectedAudioTrackId(newTrackId);
    setShowMusicLibrary(true); // Open library to select a file
    console.log('Adding new music track, opening library...');
  };

  const handleAddSfxTrack = () => {
    const newTrackId = `sfx-${Date.now()}`;
     const newTrack: AudioTrack = {
      id: newTrackId,
      name: `SFX Track ${audioTracks.filter(t => t.sourceType === 'sfx').length + 1}`,
      volume: 70,
      isMuted: false,
      sourceType: 'sfx',
      effects: [],
    };
    setAudioTracks(prev => [...prev, newTrack]);
    setSelectedAudioTrackId(newTrackId);
    // Optionally open SFX library or allow drag-drop
    console.log('Adding new SFX track...');
  };
  
  const handleApplyAiSoundSuggestion = (suggestion: AiSoundSuggestion) => {
    console.log('Applying AI Sound Suggestion:', suggestion.description);
    // This would involve creating a new track or adding a clip to an existing SFX track
    // For now, just log it
    const newTrackId = `sfx-ai-${Date.now()}`;
    const newTrack: AudioTrack = {
      id: newTrackId,
      name: suggestion.description.substring(0, 30) + "...", // Truncate name
      volume: 70,
      isMuted: false,
      sourceType: 'sfx',
      sourceFile: suggestion.soundPreviewUrl,
      effects: [],
    };
    setAudioTracks(prev => [...prev, newTrack]);
    alert(`Added "${suggestion.description}" to timeline (simulated).`);
  };

  const handleToggleEffectsPanel = (trackId: string) => {
    setShowEffectsPanelForTrack(prev => prev === trackId ? null : trackId);
  };
  
  // End Audio Tab Handlers

  // Visual Tab Handlers
  const handleToggleVisualEffect = (effectId: string) => {
    setAppliedVisualEffects(prev => 
      prev.map(effect => effect.id === effectId ? { ...effect, isEnabled: !effect.isEnabled } : effect)
    );
    // If disabling, and it was the selected one, deselect it to hide its properties panel
    if (selectedEffectId === effectId && !appliedVisualEffects.find(e => e.id === effectId)?.isEnabled) {
      setSelectedEffectId(null);
    }
  };

  const handleVisualEffectPropertyChange = (effectId: string, propertyName: string, value: any) => {
    setAppliedVisualEffects(prev =>
      prev.map(effect =>
        effect.id === effectId
          ? { ...effect, properties: { ...effect.properties, [propertyName]: value } }
          : effect
      )
    );
  };

  const handleAddFilter = (filterPreset: string) => {
    const newFilter: VisualEffect = {
      id: `filter-${filterPreset}-${Date.now()}`,
      name: `${filterPreset.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Filter`,
      type: 'filter',
      isEnabled: true,
      properties: { filterPreset: filterPreset, intensity: 0.5 },
    };
    setAppliedVisualEffects(prev => [...prev, newFilter]);
    setSelectedEffectId(newFilter.id);
    setShowFilterGallery(false);
    console.log('Added filter:', filterPreset);
  };

  const handleAddOverlay = (overlayUrl: string) => {
    const newOverlay: VisualEffect = {
      id: `overlay-${Date.now()}`,
      name: 'New Overlay',
      type: 'overlay',
      isEnabled: true,
      properties: { overlayUrl: overlayUrl, opacity: 0.7, scale: 1, rotation: 0, blendMode: 'normal' },
    };
    setAppliedVisualEffects(prev => [...prev, newOverlay]);
    setSelectedEffectId(newOverlay.id);
    setShowOverlayLibrary(false);
    console.log('Added overlay:', overlayUrl);
  };

  const handleApplyAiVisualSuggestion = (suggestion: AiVisualSuggestion) => {
    console.log('Applying AI Visual Suggestion:', suggestion.id, suggestion.description);
    let newEffectId = `ai-${suggestion.effectType}-${Date.now()}`;

    if (suggestion.effectType === 'lighting') {
      // Attempt to modify an existing general color correction, or add a new one.
      const existingCC = appliedVisualEffects.find(e => e.type === 'color-correction' && e.name.toLowerCase().includes('primary'));
      if (existingCC) {
        const updatedProperties = { ...existingCC.properties };
        if (suggestion.details.brightnessTarget !== undefined) updatedProperties.brightness = (updatedProperties.brightness || 0) + suggestion.details.brightnessTarget;
        if (suggestion.details.contrastTarget !== undefined) updatedProperties.contrast = (updatedProperties.contrast || 0) + suggestion.details.contrastTarget;
        if (suggestion.details.saturationTarget !== undefined) updatedProperties.saturation = (updatedProperties.saturation || 0) + suggestion.details.saturationTarget;
        
        setAppliedVisualEffects(prev => prev.map(e => e.id === existingCC.id ? {...e, properties: updatedProperties, isEnabled: true } : e));
        newEffectId = existingCC.id; // So we can select it
        alert(`Updated "${existingCC.name}" based on AI lighting suggestion.`);
      } else {
        const newLightEffect: VisualEffect = {
          id: newEffectId,
          name: `AI Lighting (${suggestion.details.targetArea || 'General'})`,
          type: 'color-correction',
          isEnabled: true,
          properties: {
            brightness: suggestion.details.brightnessTarget,
            contrast: suggestion.details.contrastTarget,
            saturation: suggestion.details.saturationTarget,
            // Could add more specific CC properties if AI suggests (e.g. temperature for faces)
          },
        };
        setAppliedVisualEffects(prev => [newLightEffect, ...prev]);
        alert(`Added new "${newLightEffect.name}" effect.`);
      }
    } else if (suggestion.effectType === 'filter' && suggestion.details.filterPresetToApply) {
      const newFilterEffect: VisualEffect = {
        id: newEffectId,
        name: `AI Filter: ${suggestion.details.filterPresetToApply.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        type: 'filter',
        isEnabled: true,
        properties: {
          filterPreset: suggestion.details.filterPresetToApply,
          intensity: suggestion.details.intensity || 0.5, 
        },
      };
      setAppliedVisualEffects(prev => [newFilterEffect, ...prev]);
      alert(`Added new "${newFilterEffect.name}" filter.`);
    } else if (suggestion.effectType === 'framing' && (suggestion.details.cropRect || suggestion.details.zoomFactor)) {
      const newTransformEffect: VisualEffect = {
        id: newEffectId,
        name: `AI Framing: ${suggestion.description.substring(0,20)}...`,
        type: 'transform',
        isEnabled: true,
        properties: {
          crop: suggestion.details.cropRect,
          zoom: suggestion.details.zoomFactor,
          // position could also be part of framing if AI suggests re-positioning
        },
      };
      setAppliedVisualEffects(prev => [newTransformEffect, ...prev]);
      alert(`Added new "${newTransformEffect.name}" effect for framing.`);
    } else if (suggestion.effectType === 'stabilization') {
      // Placeholder: Stabilization might be a unique effect type or a property of a transform/generic enhancement effect
      // For now, let's assume it adds a conceptual "Stabilization" effect tag or modifies a general enhancement effect.
      const newStabilizeEffect: VisualEffect = {
        id: newEffectId,
        name: `AI Stabilization (${suggestion.details.stabilizationLevel})`,
        type: 'transform', // Or a dedicated 'stabilization' type if you add it
        isEnabled: true,
        properties: { 
          // This is conceptual - actual stabilization properties would be complex
          stabilizationStrength: suggestion.details.stabilizationLevel === 'high' ? 0.9 : suggestion.details.stabilizationLevel === 'medium' ? 0.6 : 0.3,
        },
      };
      setAppliedVisualEffects(prev => [newStabilizeEffect, ...prev]);
      alert(`Added "${newStabilizeEffect.name}" effect.`);
    } else {
      alert(`AI suggestion "${suggestion.description}" applied (simulated - no specific action for this type yet).`);
      return; // Early return if no specific logic handled it
    }

    // Highlight the newly added/modified effect and select it
    // Ensure the effect is actually added and then select it
    setTimeout(() => { // Use timeout to allow state to update before selecting
      const effectToSelect = appliedVisualEffects.find(e => e.id === newEffectId);
      if(effectToSelect) {
         setSelectedEffectId(newEffectId);
      } else {
        // If it was a modification of an existing one, that newEffectId is already set
        // If it was a new effect that somehow didn't get added with the newEffectId, find by name as fallback (less reliable)
        const justAddedEffect = appliedVisualEffects.find(e => e.id.startsWith('ai-'));
        if (justAddedEffect) setSelectedEffectId(justAddedEffect.id);
      }
    }, 0);
  };

  // End Visual Tab Handlers

  // Command Suggestions for different tabs
  const allCommandSuggestions: CommandSuggestion[] = [
    // General / AI Suggestions Tab
    { text: "summarize this video", tab: 'ai-suggestions' },
    { text: "find key moments", tab: 'ai-suggestions' },
    { text: "suggest b-roll for topic 1", tab: 'ai-suggestions' },
    { text: "improve pacing for intro segment", tab: 'ai-suggestions' },
    { text: "check for technical issues", tab: 'ai-suggestions' },

    // Captions Tab
    { text: "translate captions to Spanish", tab: 'captions' },
    { text: "animate captions for speaker Host 1", tab: 'captions' },
    { text: "check captions for errors", tab: 'captions' },
    { text: "apply 'Highlight Yellow' to all key points", tab: 'captions' },
    { text: "export SRT file", tab: 'captions' },

    // Audio Tab
    { text: "enhance audio clarity for main track", tab: 'audio' },
    { text: "add background music (chill vibe)", tab: 'audio' },
    { text: "reduce background noise in interview segment", tab: 'audio' },
    { text: "master audio for YouTube", tab: 'audio' },
    { text: "add reverb to Host 2 voice", tab: 'audio' },
    
    // Will be expanded for other tabs like 'visual', 'b-roll' etc.
  ];

  const getCurrentCommandSuggestions = () => {
    let suggestions = allCommandSuggestions.filter(s => s.tab === activeEditTab);
    if (suggestions.length === 0) {
      // Fallback to general AI suggestions if no specific ones for the current tab
      suggestions = allCommandSuggestions.filter(s => s.tab === 'ai-suggestions');
    }
    return suggestions.slice(0, 5); // Show up to 5 suggestions
  };

  // B-Roll Tab Handlers
  const handleAddBRollFromSuggestion = (suggestedClip: Partial<BRollClip>, suggestionTimeCue: string) => {
    const newClip: BRollClip = {
      id: `broll-sugg-${Date.now()}`,
      name: suggestedClip.name || 'Suggested B-Roll',
      videoUrl: suggestedClip.videoUrl || '/error.mp4',
      thumbnailUrl: suggestedClip.thumbnailUrl,
      source: 'ai-library',
      duration: suggestedClip.duration || 10,
      // Simplistic time cue parsing - real app would need more robust logic
      startTimeInMainVideo: suggestionTimeCue ? parseInt(suggestionTimeCue.split(':')[0]) * 60 + parseInt(suggestionTimeCue.split(':')[1]?.split('-')[0] || '0') : undefined,
    };
    setProjectBRollClips(prev => [...prev, newClip]);
    alert(`Added "${newClip.name}" to project B-Roll.`);
  };

  const handleOpenBRollLibrary = (keywords?: string[]) => {
    // ... existing code ...
  };

  // B-Roll Library Specific Handlers
  const getFilteredLibraryClips = () => {
    setIsLoadingLibrary(true);
    // Simulate API call & filtering
    setTimeout(() => {
      let clips = masterLibraryClips;
      if (librarySearchTerm) {
        clips = clips.filter(clip => 
          clip.name.toLowerCase().includes(librarySearchTerm.toLowerCase()) || 
          clip.tags?.some(tag => tag.toLowerCase().includes(librarySearchTerm.toLowerCase()))
        );
      }
      if (libraryFilters.category !== 'all') {
        clips = clips.filter(clip => clip.tags?.includes(libraryFilters.category.toLowerCase()));
      }
      if (libraryFilters.orientation !== 'any') {
        clips = clips.filter(clip => clip.orientation === libraryFilters.orientation);
      }
      if (libraryFilters.duration !== 'any') {
        const maxDuration = parseInt(libraryFilters.duration);
        clips = clips.filter(clip => clip.duration <= maxDuration);
      }
      setFilteredLibraryClips(clips);
      setIsLoadingLibrary(false);
    }, 500);
  };

  const handleSmartSearchBRoll = () => {
    if (!selectedSegment) {
      alert("Please select a segment on the main timeline first to get smart B-Roll suggestions.");
      setLibrarySearchTerm(""); // Clear search if no segment
      setLibraryFilters({ category: 'all', duration: 'any', orientation: 'any' });
      setShowBRollLibrary(true);
      return;
    }

    const segmentData = timelineSegments.find(s => s.id === selectedSegment);
    if (!segmentData || !segmentData.keywords || segmentData.keywords.length === 0) {
      alert(`No specific keywords found for segment: "${segmentData?.title || selectedSegment}". Please try a manual search.`);
      setLibrarySearchTerm(""); // Clear search if no keywords for segment
      setLibraryFilters({ category: 'all', duration: 'any', orientation: 'any' });
      setShowBRollLibrary(true);
      return;
    }

    // Simulate AI processing and keyword selection
    setIsLoadingLibrary(true); // Use this for feedback
    setShowBRollLibrary(true);
    setSelectedLibraryClip(null); // Reset selected clip
    console.log(`AI generating B-Roll search for segment: "${segmentData.title}" using keywords:`, segmentData.keywords);
    
    // Pick a couple of keywords for the search term
    const smartSearchTerms = segmentData.keywords.slice(0, 2).join(' ');
    setLibrarySearchTerm(smartSearchTerms);

    // Example: AI might also infer a category
    let inferredCategory = 'all';
    if (segmentData.keywords.includes('artificial intelligence') || segmentData.keywords.includes('tech concepts')) {
      inferredCategory = 'tech';
    } else if (segmentData.keywords.includes('video production') || segmentData.keywords.includes('creativity')) {
      inferredCategory = 'abstract'; // Or 'business' depending on context
    } else if (segmentData.keywords.includes('interview')) {
      inferredCategory = 'people';
    }
    setLibraryFilters({ category: inferredCategory, duration: 'any', orientation: 'any' });
  };
  // End B-Roll Tab Handlers

  // useEffect for B-Roll library filtering
  useEffect(() => {
    if (showBRollLibrary) {
      getFilteredLibraryClips();
    }
  }, [librarySearchTerm, libraryFilters, showBRollLibrary, masterLibraryClips]);

  const handleUploadCustomBRoll = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*'; // Accept video files
    fileInput.style.display = 'none';

    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        console.log('Selected B-Roll file for upload:', file);
        // Here, you would typically start the upload process
        // For now, let's simulate adding it as a project B-Roll clip
        const newClip: BRollClip = {
          id: `broll-upload-${Date.now()}`,
          name: file.name,
          videoUrl: URL.createObjectURL(file), // Temporary URL for local preview
          thumbnailUrl: undefined, // Thumbnail generation would be more complex
          source: 'user-upload',
          duration: 0, // Actual duration would need to be read from video metadata
          startTimeInMainVideo: undefined, // User would place this on timeline later
        };
        setProjectBRollClips(prev => [...prev, newClip]);
        alert(`"${file.name}" selected and conceptually added to project B-Roll. Upload process would start here.`);
        document.body.removeChild(fileInput); // Clean up the input element
      } else {
        document.body.removeChild(fileInput); // Clean up if no file selected
      }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  const handleRemoveBRollClip = (clipId: string) => {
    // ... existing code ...
  };

  // Helper function to add sticker to thumbnail
  const handleAddStickerToThumbnail = (sticker: typeof sampleStickers[0]) => {
    const newActiveSticker: ActiveSticker = {
      ...sticker,
      id: `${sticker.id}-${Date.now()}`, // Ensure unique ID for each instance
      x: 20 + Math.random() * 60, // Random X (20-80%)
      y: 20 + Math.random() * 60, // Random Y (20-80%)
      scale: 1,
      rotation: Math.random() * 40 - 20, // Random rotation (-20 to 20 deg)
    };
    setActiveStickers(prev => [...prev, newActiveSticker]);
  };

  // Sticker Drag Handlers
  const handleStickerDragStart = (e: React.MouseEvent<HTMLDivElement>, stickerId: string) => {
    if (!thumbnailPreviewRef.current) return;
    const stickerElement = e.currentTarget;
    const stickerRect = stickerElement.getBoundingClientRect();
    
    const offsetX = e.clientX - stickerRect.left;
    const offsetY = e.clientY - stickerRect.top;

    setDraggingSticker({ id: stickerId, offsetX, offsetY });
    e.preventDefault(); 
  };

  const handleStickerDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingSticker || !thumbnailPreviewRef.current) return;

    const previewRect = thumbnailPreviewRef.current.getBoundingClientRect();
    
    // Set center of sticker to cursor position relative to preview container
    let newXPercent = ((e.clientX - previewRect.left) / previewRect.width) * 100;
    let newYPercent = ((e.clientY - previewRect.top) / previewRect.height) * 100;

    // Constrain center to be within the preview box (0-100%)
    newXPercent = Math.max(0, Math.min(100, newXPercent));
    newYPercent = Math.max(0, Math.min(100, newYPercent));

    setActiveStickers(prev => 
      prev.map(s => s.id === draggingSticker.id ? { ...s, x: newXPercent, y: newYPercent } : s)
    );
  };

  const handleStickerDragEnd = () => {
    setDraggingSticker(null);
  };

  const handleRemoveSticker = (stickerIdToRemove: string) => {
    setActiveStickers(prev => prev.filter(s => s.id !== stickerIdToRemove));
  };
  // End Sticker Drag Handlers

  // Placeholder data for new suggestion types
  const sampleGraphics: Suggestion[] = [
    { id: 'graphic-logo-main', display: 'Main Brand Logo', desc: 'The primary logo appearing at multiple points', type: 'graphic', imageUrl: 'https://readdy.ai/api/search-image?query=modern%20company%20logo%20placeholder&width=100&height=100&seq=g1' },
    { id: 'graphic-lowerthird-host1', display: 'Host 1 Lower Third', time: '00:38', desc: 'Lower third graphic for Host 1 introduction', type: 'graphic' },
  ];

  const sampleOnScreenTexts: Suggestion[] = [
    { id: 'text-key-stat', display: '\"70% Increase\"', time: '15:22', desc: 'Key statistic displayed on screen', type: 'onScreenText', rawText: 'A 70% Increase in Efficiency' },
    { id: 'text-website-url', display: 'www.example.com', time: '55:10', desc: 'Website URL shown at conclusion', type: 'onScreenText', rawText: 'Visit us at www.example.com for more' },
  ];

  const sampleDetectedObjects: Suggestion[] = [
    { id: 'object-laptop-host2', display: 'Host 2\'s Laptop', time: '10:15', desc: 'Laptop visible on Host 2\'s desk', type: 'object', imageUrl: 'https://readdy.ai/api/search-image?query=laptop%20on%20desk%20close%20up&width=100&height=100&seq=o1' },
    { id: 'object-mic-guest', display: 'Guest\'s Microphone', time: '26:00', desc: 'Microphone used by the guest', type: 'object' },
  ];

  const sampleDetectedScenes: Suggestion[] = [
    { id: 'scene-interview-setup', display: 'Main Interview Area', time: '00:30-38:30', desc: 'The primary two-host interview setup', type: 'scene', imageUrl: 'https://readdy.ai/api/search-image?query=podcast%20studio%20wide%20shot&width=100&height=100&seq=s1' },
    { id: 'scene-whiteboard-explain', display: 'Whiteboard Explanation', time: '12:05-14:30', desc: 'Segment where host uses a whiteboard', type: 'scene' },
  ];

  const sampleUserMarkers: Suggestion[] = [
    { id: 'marker-product-reveal', display: 'Product Reveal Moment', time: '18:45', desc: 'User-defined marker for key product reveal', type: 'marker' },
    { id: 'marker-important-quote', display: 'Crucial Guest Quote', time: '32:12', desc: 'Marker for an important statement by the guest', type: 'marker' },
  ];

  // New function to handle quick filter button clicks
  const handleQuickFilterClick = (filter: SuggestionType | 'all') => {
    setActiveSuggestionCategoryFilter(filter);
    // Re-filter suggestions based on the new category and existing commandActionText
    // This manually re-triggers the filtering logic similar to handleCommandInputChange
    const value = commandActionText;
    const lastAtSymbolIndex = value.lastIndexOf('@');
    
    if (lastAtSymbolIndex !== -1 && (!activePill || value.length > lastAtSymbolIndex +1)) {
      const fullQueryAfterAt = value.slice(lastAtSymbolIndex + 1);
      let currentPrefixCategory: SuggestionType | 'all' = 'all';
      let currentSearchTerm = fullQueryAfterAt.toLowerCase().trim();

      // Check for specific category prefixes to respect them even when quick filtering
      if (fullQueryAfterAt.startsWith('speaker:')) { currentPrefixCategory = 'speaker'; currentSearchTerm = fullQueryAfterAt.substring('speaker:'.length).toLowerCase().trim(); }
      else if (fullQueryAfterAt.startsWith('graphic:')) { currentPrefixCategory = 'graphic'; currentSearchTerm = fullQueryAfterAt.substring('graphic:'.length).toLowerCase().trim(); }
      else if (fullQueryAfterAt.startsWith('text:')) { currentPrefixCategory = 'onScreenText'; currentSearchTerm = fullQueryAfterAt.substring('text:'.length).toLowerCase().trim(); }
      else if (fullQueryAfterAt.startsWith('object:')) { currentPrefixCategory = 'object'; currentSearchTerm = fullQueryAfterAt.substring('object:'.length).toLowerCase().trim(); }
      else if (fullQueryAfterAt.startsWith('scene:')) { currentPrefixCategory = 'scene'; currentSearchTerm = fullQueryAfterAt.substring('scene:'.length).toLowerCase().trim(); }
      else if (fullQueryAfterAt.startsWith('marker:')) { currentPrefixCategory = 'marker'; currentSearchTerm = fullQueryAfterAt.substring('marker:'.length).toLowerCase().trim(); }

      const allSuggestionsSource: Suggestion[] = [ /* ... gather all suggestions as before ... */
        ...timelineSegments.map(segment => ({ id: `segment-${segment.id}`, display: segment.title, time: segment.startTime, desc: `${segment.title} segment (${segment.startTime}-${segment.endTime})`, type: 'segment' as SuggestionType, })),
        ...initialTranscriptData.filter(item => item.isKeyPoint).map(item => ({ id: `transcript-${item.id}`, display: item.text.length > 30 ? item.text.substring(0, 30) + '...' : item.text, time: item.time, desc: `${item.speaker}: "${item.text.substring(0, 40)}${item.text.length > 40 ? '...' : ''}"`, type: 'transcript' as SuggestionType, })),
        ...aiSuggestions.map(sugg => ({ id: `suggestion-${sugg.id}`, display: sugg.title, time: sugg.time.split(' - ')[0], desc: sugg.desc, type: 'aiSuggestion' as SuggestionType, })),
        ...Array.from(new Set(initialTranscriptData.map(item => item.speaker))).filter(speaker => speaker).map(speaker => ({ id: `speaker-${speaker.replace(/\s+/g, '-')}`, display: speaker, desc: `Reference speaker: ${speaker}`, type: 'speaker' as SuggestionType, name: speaker, })),
        ...sampleGraphics, ...sampleOnScreenTexts, ...sampleDetectedObjects, ...sampleDetectedScenes, ...sampleUserMarkers,
      ];

      let tempFilteredSuggestions = allSuggestionsSource;

      // Apply the NEWLY CLICKED quick filter first, UNLESS a prefix in the input overrides it
      const effectiveFilter = currentPrefixCategory !== 'all' ? currentPrefixCategory : filter;

      if (effectiveFilter !== 'all') {
        if (effectiveFilter === 'segment') { // Assuming 'segment' might become a proxy for 'Time' based items
           tempFilteredSuggestions = tempFilteredSuggestions.filter(s => s.type === 'segment' || s.type === 'transcript' || s.type === 'aiSuggestion' || s.type === 'marker');
        } else {
           tempFilteredSuggestions = tempFilteredSuggestions.filter(s => s.type === effectiveFilter);
        }
      }
      
      if (currentSearchTerm) {
        tempFilteredSuggestions = tempFilteredSuggestions.filter(s => 
            s.display.toLowerCase().includes(currentSearchTerm) || 
            s.desc.toLowerCase().includes(currentSearchTerm) ||
            (s.time && s.time.includes(currentSearchTerm)) ||
            (s.name && s.name.toLowerCase().includes(currentSearchTerm))
          );
      }
      setFilteredSuggestions(tempFilteredSuggestions);
    } else if (!value.includes('@')) { // If @ was removed or not present, still apply filter to full list
        const allSuggestionsSource: Suggestion[] = [ /* ... gather all suggestions ... */ ];
        let tempFilteredSuggestions = allSuggestionsSource;
        if (filter !== 'all') {
            if (filter === 'segment') { tempFilteredSuggestions = tempFilteredSuggestions.filter(s => s.type === 'segment' || s.type === 'transcript' || s.type === 'aiSuggestion' || s.type === 'marker'); }
            else { tempFilteredSuggestions = tempFilteredSuggestions.filter(s => s.type === filter); }
        }
        setFilteredSuggestions(tempFilteredSuggestions);
        setShowTimestampDropdown(true); // Keep dropdown open or open it if it was closed
    }
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
      <Header />

      {/* Project Info Bar - MODIFIED */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-white mr-4">Podcast Episode #42 - AI in Content Creation</h2>
            <span className="text-sm text-gray-400">Last edited: 2 minutes ago</span>
          </div>
          {/* --- Button Group Moved to Right --- */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleToggleEditMode}
              className={`flex items-center space-x-1 ${editMode ? 'bg-primary' : 'bg-gray-800 hover:bg-gray-700'} text-white px-3 py-1.5 rounded-button text-sm whitespace-nowrap`}
            >
              <i className={`${editMode ? 'ri-check-line' : 'ri-edit-line'} mr-1`}></i>
              <span>{editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}</span>
            </button>
            {/* Removed Share Button */}
            <button
              onClick={handleGenerateShortClips} // Added Generate Clips button
              className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-button text-sm whitespace-nowrap"
            >
              <i className="ri-scissors-cut-line"></i>
              <span>Generate Clips</span>
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center space-x-1 bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-button text-sm whitespace-nowrap"
            >
              <i className="ri-download-line"></i>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main container for video/timeline and editing panel */}
      <div className={`flex flex-1 overflow-hidden ${editMode ? 'lg:flex-row' : 'flex-col'}`}>
        {/* Main Content Area (Video Player & Timeline) */}
        <div className={`flex-1 flex flex-col overflow-hidden ${editMode ? 'lg:w-2/3' : 'w-full'} ${!editMode ? 'pb-36' : ''}`}> {/* MODIFIED: Increased conditional padding to pb-36 */}
          {/* Video Player Section - Enhanced */}
          <div className="bg-gray-900 py-2 flex-1 min-h-0"> {/* MODIFIED: Reduced padding py-6 to py-2, added flex-1 and min-h-0 */}
            <div className="container mx-auto px-4 h-full"> {/* Added h-full for flex child */}
              <div className="video-container relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-xl h-full"> {/* MODIFIED: Added h-full, though aspect-video might conflict. Let's test. */}
                <img 
                  src="https://readdy.ai/api/search-image?query=professional%20podcast%20recording%20studio%20with%20two%20people%20having%20a%20conversation%2C%20high%20quality%20camera%20setup%2C%20multiple%20angles%2C%20professional%20lighting%2C%20microphones%20visible%2C%20modern%20studio%20environment%2C%20digital%20displays&width=1280&height=720&seq=1&orientation=landscape" 
                  alt="Video preview" 
                  className="w-full h-full object-cover"
                />
                
                {/* AI Annotations overlay - Only visible when showAnnotations is true */}
                {showAnnotations && (
                  <div className="absolute inset-0">
                    {/* Example caption annotation */}
                    <div className="absolute left-[25%] top-[70%] bg-black/60 text-white px-3 py-1 rounded text-sm border-l-4 border-primary">
                      Auto-generated caption: Key points
                    </div>
                    {/* Example transition annotation */}
                    <div className="absolute left-[40%] top-[20%] w-8 h-8 rounded-full bg-purple-500/50 flex items-center justify-center" title="AI-applied transition">
                      <i className="ri-transition-line text-white"></i>
                    </div>
                    {/* Example enhancement annotation */}
                    <div className="absolute right-[20%] top-[40%] w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center" title="AI-enhanced lighting">
                      <i className="ri-sun-line text-white"></i>
                    </div>
                  </div>
                )}
                
                {/* Video Controls - Enhanced */}
                <div className="video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <button onClick={handlePlayPause} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
                        <i className={isVideoPlaying ? "ri-pause-fill ri-lg" : "ri-play-fill ri-lg"}></i>
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
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={volume}
                          onChange={handleVolumeChange} 
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-white">
                      <span className="text-sm">12:34 / 58:21</span>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                        <i className="ri-settings-3-line"></i>
                      </button>
                      <button 
                        onClick={handleFullscreenToggle}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                        <i className={isFullscreen ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"}></i>
                      </button>
                    </div>
                  </div>
                  <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-primary rounded-full" style={{ width: `${currentPosition}%` }}></div>
                    <div className="absolute top-0 bottom-0 w-1 h-full bg-white rounded-full" style={{ left: `${currentPosition}%` }}></div>
                  </div>
                </div>
                
                {/* Annotation Toggle - Enhanced */}
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm z-10">
                  <span>AI Annotations</span>
                  <label className="custom-switch">
                    <input type="checkbox" checked={showAnnotations} onChange={handleToggleAnnotations} />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section - Enhanced to match the provided image */}
          <div className="bg-gray-900 border-t border-b border-gray-800 py-2 flex-shrink-0"> {/* MODIFIED: Reduced padding py-4 to py-2, added flex-shrink-0 */}
            <div className="container mx-auto px-4">
              {/* Timeline Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-white font-medium text-lg">Timeline</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <i className="ri-time-line"></i>
                    <span>Total Duration: 58:21</span> {/* Placeholder duration */}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={handleZoomOut} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300" title="Zoom Out">
                      <i className="ri-zoom-out-line"></i>
                    </button>
                    {/* <span className="text-sm text-gray-400">{zoomLevel}x</span> */}
                    <button onClick={handleZoomIn} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300" title="Zoom In">
                      <i className="ri-zoom-in-line"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Informational Tooltip */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <i className="ri-information-line text-primary"></i>
                  <span>Click on any segment to view details and edit options. Hover over segments to preview content.</span>
                </div>
              </div>

              {/* Timeline Main Area */}
              <div ref={timelineRef} className="relative w-full h-32 bg-gray-800 rounded-lg overflow-visible shadow-lg">
                {/* Timeline Ruler */}
                <div className="absolute top-0 left-0 right-0 h-6 flex border-b border-gray-700">
                  <div className="flex-1 flex" style={{ transform: `scaleX(${zoomLevel})`, transformOrigin: 'left' }}>
                    {['00:00', '10:00', '20:00', '30:00', '40:00', '50:00', '1:00:00'].map((time, index, arr) => (
                      <div key={time} className={`flex-1 ${index < arr.length -1 ? 'border-r' : ''} border-gray-700 text-xs text-gray-500 pl-1 pt-0.5`}>
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Timeline Segments Container - Increased height to accommodate labels below */}
                <div className="absolute top-6 left-0 right-0 bottom-0 flex pt-1" style={{transform: `scaleX(${zoomLevel})`, transformOrigin: 'left'}}>
                  {timelineSegments.map((segment) => (
                    <div 
                      key={segment.id}
                      // Use flex-grow to allow segments to take up their defined width percentage effectively when zoomed
                      className={`timeline-segment group relative border-r border-gray-700 ${selectedSegment === segment.id ? 'ring-2 ring-primary ring-offset-1 ring-offset-gray-800' : ''}`}
                      style={{ width: `${segment.width}%` }} // Width is a percentage
                      onClick={() => handleTimelineSegmentClick(segment.id)}
                    >
                      {/* Colored Segment Bar */}
                      <div className={`h-6 bg-${segment.color}/70 hover:bg-${segment.color}/90 transition-colors duration-150 relative`}>
                        {/* Marker on top of the segment bar */}
                        {segment.markerColor && (
                          <div className={`timeline-marker bg-${segment.markerColor}`} style={{left: '50%'}}></div>
                        )}
                        {/* B-Roll Indicator Icon */}
                        {
                          projectBRollClips.some(bClip => {
                            if (bClip.startTimeInMainVideo === undefined) return false;
                            // Convert segment times to seconds for comparison
                            const segStartTime = (parseInt(segment.startTime.split(':')[0]) * 60) + parseInt(segment.startTime.split(':')[1]);
                            const segEndTime = (parseInt(segment.endTime.split(':')[0]) * 60) + parseInt(segment.endTime.split(':')[1]);
                            return bClip.startTimeInMainVideo >= segStartTime && bClip.startTimeInMainVideo < segEndTime;
                          }) && (
                            <i 
                              className="ri-movie-2-fill text-white/70 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs z-10"
                              title="Contains B-Roll"
                            ></i>
                          )
                        }
                      </div>
                      {/* Labels below the segment bar */}
                      <div className="absolute -bottom-7 left-0 right-0 text-center px-1">
                        <span className="block text-xs text-gray-300 truncate">{segment.title}</span>
                        <div className="text-[10px] text-gray-500">{segment.startTime} - {segment.endTime}</div>
                      </div>

                      {/* Enhanced Hover Preview Card (Timeline Thumbnail) */}
                      <div className="timeline-thumbnail w-64 bg-gray-900 rounded-lg shadow-xl z-20">
                        <div className="p-2">
                          <img src={segment.image || 'https://via.placeholder.com/160x90.png/0f172a/e2e8f0?text=No+Preview'} alt={`${segment.title} thumbnail`} className="w-full h-32 object-cover rounded" />
                        </div>
                        <div className="p-3 border-t border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium truncate">{segment.title}</span>
                            <span className={`text-xs bg-${segment.color}/20 text-${segment.color} px-2 py-0.5 rounded-full`}>{segment.startTime} - {segment.endTime}</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {segment.id === 'intro' ? 'Show opening, host introductions and episode overview.' : 
                             segment.id === 'topic1' ? 'Discussion on fundamental AI concepts and their relevance.' : 
                             'Details for this segment will appear here.' // Default description
                            }
                          </p>
                          {segment.id === 'intro' && (
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <i className="ri-mic-line"></i>
                                <span>2 Hosts</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <i className="ri-movie-line"></i>
                                <span>Opening Graphics</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Current Position Indicator (Playhead) */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10 opacity-75 pointer-events-none" style={{ left: `${currentPosition}%` }}>
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-full"></div>
                </div>
                
                {/* AI Edit Markers - small lines above segments */}
                {/* Container needs to be correctly positioned relative to ruler + segments */}
                <div className="absolute top-6 left-0 right-0 h-full pointer-events-none" style={{transform: `scaleX(${zoomLevel})`, transformOrigin: 'left'}}>
                  {/* Example markers, these would be driven by actual AI edit data */}
                  <div className="absolute top-[-4px] w-1 h-2.5 bg-blue-400 rounded-full" style={{left: '15%'}} title="AI Caption"></div>
                  <div className="absolute top-[-4px] w-1 h-2.5 bg-purple-400 rounded-full" style={{left: '28%'}} title="AI Transition"></div>
                  <div className="absolute top-[-4px] w-1 h-2.5 bg-green-400 rounded-full" style={{left: '42%'}} title="B-Roll Added"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Editing Panel - Will be shown conditionally based on editMode */}
        {editMode && (
          <div className="w-full lg:w-1/3 bg-gray-800 overflow-y-auto border-l border-gray-700 lg:h-full scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-gray-800">
            {/* Editing Panel Tabs */}
            <div className="sticky top-0 bg-gray-900 z-10 border-b border-gray-800 px-2">
              <div className="overflow-x-auto scrollbar-none">
                <div className="flex items-center whitespace-nowrap py-2">
                  <button 
                    onClick={() => handleTabClick('ai-suggestions')}
                    className={`tab-button px-4 py-2 font-medium rounded-t-lg ${activeEditTab === 'ai-suggestions' ? 'text-primary active' : 'text-gray-400 hover:text-white'}`}
                  >
                    <i className="ri-magic-line mr-1.5"></i>AI Suggestions
                  </button>
                  <button 
                    onClick={() => handleTabClick('captions')}
                    className={`tab-button px-4 py-2 font-medium rounded-t-lg ${activeEditTab === 'captions' ? 'text-primary active' : 'text-gray-400 hover:text-white'}`}
                  >
                    <i className="ri-text-spacing"></i> Captions
                  </button>
                  <button 
                    onClick={() => handleTabClick('audio')}
                    className={`tab-button px-4 py-2 font-medium rounded-t-lg ${activeEditTab === 'audio' ? 'text-primary active' : 'text-gray-400 hover:text-white'}`}
                  >
                    <i className="ri-sound-module-line"></i> Audio
                  </button>
                  <button 
                    onClick={() => handleTabClick('visual')}
                    className={`tab-button px-4 py-2 font-medium rounded-t-lg ${activeEditTab === 'visual' ? 'text-primary active' : 'text-gray-400 hover:text-white'}`}
                  >
                    <i className="ri-palette-line"></i> Visual
                  </button>
                  <button 
                    onClick={() => handleTabClick('b-roll')}
                    className={`tab-button px-4 py-2 font-medium rounded-t-lg ${activeEditTab === 'b-roll' ? 'text-primary active' : 'text-gray-400 hover:text-white'}`}
                  >
                    <i className="ri-movie-line"></i> B-Roll
                  </button>
                  <button 
                    onClick={() => handleTabClick('thumbnails')}
                    className={`tab-button px-4 py-2 font-medium rounded-t-lg ${activeEditTab === 'thumbnails' ? 'text-primary active' : 'text-gray-400 hover:text-white'}`}
                  >
                    <i className="ri-image-edit-line mr-1.5"></i> Thumbnails
                  </button>
                </div>
              </div>
            </div>

            {/* Command Bar - WITHIN EDIT PANEL */}
            <div className="p-4 border-b border-gray-700 bg-gray-900/50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-cpu-line text-primary"></i>
                </div>
                <input 
                  type="text" 
                  className="command-input w-full bg-gray-800/80 border border-gray-700 text-white px-10 py-3 rounded-lg shadow-inner" 
                  placeholder="Ask AI to edit your video... (e.g., 'add zoom at 12:34')"
                  value={commandInputValue} // Ensure this uses the correct state for the edit panel input
                  onChange={(e) => setCommandInputValue(e.target.value)} // Ensure this updates the correct state
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // TODO: Implement distinct submit logic if needed, using commandInputValue
                      console.log('Edit Panel Command Submit:', commandInputValue); 
                      setCommandInputValue(''); // Clear this specific input
                    }
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button className="text-gray-400 hover:text-primary">
                    <i className="ri-mic-line"></i>
                  </button>
                </div>
              </div>
              {/* Removed old text suggestions div */}
              {/* Horizontally Scrollable Suggestion Pills */}
              <div className="mt-3 flex overflow-x-auto scrollbar-none whitespace-nowrap gap-2 py-1">
                <span className="text-xs text-gray-500 py-1 mr-1 flex-shrink-0">Try:</span>
                {getCurrentCommandSuggestions().map(suggestion => (
                   <button 
                     key={suggestion.text} 
                     className="bg-gray-700/50 hover:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-300 cursor-pointer flex-shrink-0"
                     onClick={() => setCommandInputValue(suggestion.text)} // Populate the edit panel command bar
                   >
                     {suggestion.text}
                   </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-gray-800/50">
              {/* Segment Navigation Pills - Add this section */}
              <div className="mb-4 pb-2 border-b border-gray-700">
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
                  <button 
                    onClick={() => handleEditorSegmentNavigation(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center space-x-1.5 transition-colors duration-150 ${
                      selectedSegment === null 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <i className="ri-movie-2-line"></i>
                    <span>Overall Video</span>
                  </button>
                  {timelineSegments.map(segment => (
                    <button 
                      key={segment.id}
                      onClick={() => handleEditorSegmentNavigation(segment.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                        selectedSegment === segment.id 
                          ? `bg-${segment.color}/80 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-${segment.color}`
                          : `bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white`
                      }`}
                      title={`${segment.title} (${segment.startTime} - ${segment.endTime})`}
                    >
                      {segment.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Suggestions Tab */}
              {activeEditTab === 'ai-suggestions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg text-white font-medium">
                      {selectedSegment ? `AI Suggestions for "${timelineSegments.find(s=>s.id === selectedSegment)?.title}"` : 'Overall AI Suggestions'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Auto-apply</span>
                      <label className="custom-switch">
                        <input type="checkbox" />
                        <span className="switch-slider"></span>
                      </label>
                    </div>
                  </div>
                  {currentAiSuggestions.map(sugg => (
                    <div key={sugg.id} className="ai-suggestion bg-gray-800/80 hover:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-${sugg.color}-500/20 text-${sugg.color}-400 mr-3`}>
                          <i className={sugg.icon}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium">{sugg.title}</h4>
                            <span className={`text-xs bg-${sugg.color}-500/20 text-${sugg.color}-400 px-2 py-0.5 rounded-full`}>{sugg.type}</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{sugg.desc}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <i className="ri-time-line"></i>
                              <span>{sugg.time}</span>
                              <button className="ml-2 text-primary hover:text-primary/80">
                                <i className="ri-play-circle-line"></i>
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="text-sm text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 px-2 py-1 rounded">Preview</button>
                              <button 
                                onClick={() => handleAiSuggestionApply(sugg.id)} 
                                className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm whitespace-nowrap font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 text-center">
                    <button className="text-primary hover:text-primary/80 text-sm font-medium">
                      <i className="ri-magic-line mr-1.5"></i> 
                      {selectedSegment ? 'Generate More for Segment' : 'Generate More Suggestions'}
                    </button>
                  </div>
                </div>
              )}

              {/* Captions Tab UI */}
              {activeEditTab === 'captions' && (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between sticky top-0 bg-gray-800 p-3 -mx-4 -mt-4 z-10 border-b border-gray-700">
                    <h3 className="text-lg text-white font-medium">Customize Captions</h3>
                  </div>

                  {/* Toolbar for Captions - Search and Speaker Filter */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-1 px-1 pt-1">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <input 
                            type="search" 
                            placeholder="Search captions..." 
                            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm pl-10 focus:ring-primary focus:border-primary shadow-sm"
                            value={captionSearchTerm}
                            onChange={(e) => setCaptionSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="ri-search-line text-gray-500"></i>
                        </div>
                    </div>
                    <select 
                        className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-primary focus:border-primary shadow-sm w-full sm:w-auto"
                        value={captionSpeakerFilter}
                        onChange={(e) => setCaptionSpeakerFilter(e.target.value)}
                    >
                        {uniqueCaptionSpeakers.map(speaker => (
                            <option key={speaker} value={speaker}>{speaker === 'all' ? 'All Speakers' : speaker}</option>
                        ))}
                    </select>
                  </div>

                  {/* Caption Style Selector & Preview */}
                  <div className="mb-4 p-1">
                    <h4 className="text-md text-white font-medium mb-3">Caption Styles</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {captionStyles.map(style => (
                        <button 
                          key={style.id} 
                          onClick={() => handleCaptionStyleChange(style.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-150 ${selectedCaptionStyle === style.id ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-900/50 hover:border-primary/50'}`}
                          title={style.name}
                        >
                          <div className={`truncate ${style.previewClass}`}>{style.name}</div>
                        </button>
                      ))}
                    </div>
                    <div className="bg-black/50 rounded-lg p-4 min-h-[80px] flex items-center justify-center border border-gray-700 shadow-inner">
                      <span className={captionStyles.find(s => s.id === selectedCaptionStyle)?.previewClass || 'text-white'}>
                        {selectedSegment && captionLines.find(line => timelineSegments.find(ts => ts.id === selectedSegment)?.startTime === line.time) 
                          ? captionLines.find(line => timelineSegments.find(ts => ts.id === selectedSegment)?.startTime === line.time)?.text.substring(0,50) + '...' 
                          : captionPreviewText}
                      </span>
                    </div>
                     <input 
                        type="text" 
                        value={captionPreviewText}
                        onChange={(e) => setCaptionPreviewText(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm mt-2 focus:ring-primary focus:border-primary"
                        placeholder="Type to preview caption style"
                    />
                  </div>

                  <p className="text-xs text-gray-400 mb-3 px-1">
                    Edit individual caption lines, apply selected style, or use AI to enhance.
                  </p>

                  {/* Caption Lines Editor */}
                  <div className="flex-1 overflow-y-auto bg-gray-900/70 rounded-lg p-3 shadow-inner scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                    <div className="space-y-3">
                      {getFilteredCaptionLines().map(line => (
                        <div 
                          key={line.id} 
                          className={`p-2.5 rounded-lg transition-all duration-150 group ${editingCaptionId === line.id ? 'bg-primary/10 ring-1 ring-primary' : 'bg-gray-800/60 hover:bg-gray-800/90'}`}
                          onMouseEnter={() => setHoveredTranscriptId(line.id)} // Re-use for hover effects
                          onMouseLeave={() => setHoveredTranscriptId(null)}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-16 text-gray-500 text-xs font-mono pt-1.5 cursor-pointer hover:text-primary" title="Seek to this time">{line.time}</div>
                            <div className="flex-1 text-white text-sm">
                              <textarea 
                                value={line.text} 
                                onChange={(e) => handleCaptionTextChange(line.id, e.target.value)}
                                onFocus={() => setEditingCaptionId(line.id)}
                                onBlur={() => setEditingCaptionId(null)}
                                className={`w-full bg-transparent border-0 focus:ring-1 focus:ring-primary/50 resize-none p-1 rounded leading-relaxed hover:bg-gray-700/30 min-h-[2em] ${captionStyles.find(s => s.id === line.style)?.previewClass}`}
                                rows={Math.max(1, Math.ceil(line.text.length / 40))}
                              />
                            </div>
                            <div className={`flex flex-col space-y-1 transition-opacity duration-150 ${hoveredTranscriptId === line.id || editingCaptionId === line.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button onClick={() => applyStyleToCaptionLine(line.id, selectedCaptionStyle)} title={`Apply '${selectedCaptionStyle}' style`} className="p-1.5 text-primary hover:text-primary/80 hover:bg-gray-700 rounded">
                                <i className="ri-palette-line"></i>
                              </button>
                              <button onClick={() => handleAiCaptionCorrection(line.id)} title="AI Correct Text" className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded">
                                <i className="ri-check-double-line"></i>
                              </button>
                              <button onClick={() => handleAiKeyPhraseEmphasis(line.id)} title="AI Emphasize Key Phrases" className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 rounded">
                                <i className="ri-bold"></i>
                              </button>
                              <button onClick={() => handleToggleCaptionVisibility(line.id)} title={line.show ? "Hide Caption" : "Show Caption"} className={`p-1.5 hover:bg-gray-700 rounded ${line.show ? 'text-gray-400 hover:text-gray-200' : 'text-red-500 hover:text-red-400'}`}>
                                <i className={line.show ? "ri-eye-line" : "ri-eye-off-line"}></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Tab UI */}
              {activeEditTab === 'audio' && (
                <div className="space-y-6 h-full flex flex-col">
                  {/* Sticky Header */}
                  <div className="flex items-center justify-between sticky top-0 bg-gray-800 py-3 px-4 -mx-4 -mt-4 z-10 border-b border-gray-700">
                    <h3 className="text-lg text-white font-medium">Audio Editor</h3>
                    <button 
                      onClick={() => console.log("Audio settings/help")}
                      className="text-gray-400 hover:text-white"
                    >
                      <i className="ri-settings-3-line"></i>
                    </button>
                  </div>

                  {/* Master Volume Control */}
                  <div className="p-1">
                    <label htmlFor="masterVolume" className="block text-sm font-medium text-gray-300 mb-1.5">Master Volume</label>
                    <div className="flex items-center space-x-3">
                      <i className={`ri-volume-${masterVolume > 50 ? 'up' : masterVolume > 0 ? 'down' : 'mute'}-line text-gray-400 text-lg`}></i>
                      <input 
                        type="range" 
                        id="masterVolume" 
                        min="0" 
                        max="100" 
                        value={masterVolume} 
                        onChange={(e) => handleMasterVolumeChange(parseInt(e.target.value))}
                        className="w-full custom-range" 
                      />
                      <span className="text-sm text-gray-200 w-8 text-right">{masterVolume}%</span>
                    </div>
                  </div>
                  
                  {/* Audio Tracks Section */}
                  <div className="space-y-4 flex-1 overflow-y-auto -mr-4 pr-3 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                    <h4 className="text-md text-white font-medium mb-2 sticky top-0 bg-gray-800 py-2 -mx-1 px-1 z-[5]">Audio Tracks</h4>
                    {audioTracks.map(track => (
                      <div key={track.id} className={`p-3 rounded-lg ${selectedAudioTrackId === track.id ? 'bg-primary/10 ring-1 ring-primary' : 'bg-gray-900/60 hover:bg-gray-900/90'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white truncate" title={track.name}>{track.name}</span>
                          <div className="flex items-center space-x-2">
                             <button 
                              onClick={() => handleToggleEffectsPanel(track.id)}
                              className="p-1 text-gray-400 hover:text-primary text-xs"
                              title="Audio Effects"
                            >
                              <i className="ri-equalizer-line"></i>
                              {track.effects.length > 0 && <span className="ml-1">({track.effects.length})</span>}
                            </button>
                            <button 
                              onClick={() => toggleTrackMute(track.id)}
                              className={`p-1 text-xs ${track.isMuted ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-white'}`}
                              title={track.isMuted ? 'Unmute' : 'Mute'}
                            >
                              <i className={track.isMuted ? 'ri-volume-mute-line' : 'ri-volume-up-line'}></i>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={track.volume} 
                            onChange={(e) => handleTrackVolumeChange(track.id, parseInt(e.target.value))}
                            className="w-full custom-range" 
                            disabled={track.isMuted}
                          />
                          <span className={`text-xs w-8 text-right ${track.isMuted ? 'text-gray-600' : 'text-gray-300'}`}>{track.volume}%</span>
                        </div>
                        {/* Effects Panel (Simplified) */}
                        {showEffectsPanelForTrack === track.id && (
                          <div className="mt-3 p-3 bg-gray-800/70 rounded">
                            <p className="text-xs text-gray-400 mb-1">Applied Effects: {track.effects.join(', ') || 'None'}</p>
                            <p className="text-xs text-gray-500">Full effects panel coming soon.</p>
                             <button className="text-xs text-primary hover:underline mt-1">Manage Effects</button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="mt-3 flex gap-2">
                        <button 
                          onClick={handleAddMusicTrack}
                          className="flex-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5"
                        >
                          <i className="ri-music-2-line"></i>
                          <span>Add Music</span>
                        </button>
                         <button 
                          onClick={handleAddSfxTrack}
                          className="flex-1 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5"
                        >
                          <i className="ri-sound-module-line"></i>
                          <span>Add SFX</span>
                        </button>
                    </div>
                  </div>

                  {/* AI Sound Suggestions */}
                  <div className="pt-2">
                    <h4 className="text-md text-white font-medium mb-2">AI Sound Suggestions</h4>
                    {aiSoundSuggestions.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-2">
                        {aiSoundSuggestions.map(sugg => (
                          <div key={sugg.id} className="bg-gray-900/60 hover:bg-gray-900/90 p-2.5 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <i className={`${sugg.icon} text-primary text-lg`}></i>
                              <div className="text-xs">
                                <p className="text-gray-300">{sugg.description}</p>
                                {sugg.timeCue && <p className="text-gray-500">Time: {sugg.timeCue}</p>}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {sugg.soundPreviewUrl && (
                                <button 
                                  onClick={() => console.log('Preview AI sound:', sugg.soundPreviewUrl)} 
                                  className="p-1.5 text-gray-400 hover:text-white text-xs" title="Preview Sound"
                                >
                                  <i className="ri-play-circle-line"></i>
                                </button>
                              )}
                              <button 
                                onClick={() => handleApplyAiSoundSuggestion(sugg)}
                                className="px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs font-medium"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No AI sound suggestions at the moment.</p>
                    )}
                  </div>
                  
                  {/* Placeholder for Music/SFX Library - Could be a modal */}
                  {showMusicLibrary && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <h3 className="text-lg text-white font-medium mb-4">Music & SFX Library (Placeholder)</h3>
                        <p className="text-gray-400 mb-4">This is where you'd browse and select music or sound effects.</p>
                        <p className="text-gray-400 mb-4">For now, selecting a track here would assign it to the newly created audio track: "{audioTracks.find(t => t.id === selectedAudioTrackId)?.name}".</p>
                        <button 
                          onClick={() => {
                            // Simulate selecting a file
                            if (selectedAudioTrackId) {
                               setAudioTracks(prev => prev.map(track => track.id === selectedAudioTrackId ? {...track, sourceFile: 'example_music_track.mp3'} : track));
                            }
                            setShowMusicLibrary(false);
                          }}
                          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg mr-2"
                        >
                          Select Example Track & Close
                        </button>
                        <button 
                          onClick={() => setShowMusicLibrary(false)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                        >
                          Close Library
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Visual Tab UI */}
              {activeEditTab === 'visual' && (
                <div className="space-y-6 h-full flex flex-col">
                  {/* Sticky Header */}
                  <div className="flex items-center justify-between sticky top-0 bg-gray-800 py-3 px-4 -mx-4 -mt-4 z-10 border-b border-gray-700">
                    <h3 className="text-lg text-white font-medium">Visual Editor</h3>
                     <button 
                      onClick={() => console.log("Visual settings/help")}
                      className="text-gray-400 hover:text-white"
                    >
                      <i className="ri-settings-3-line"></i>
                    </button>
                  </div>

                  {/* Quick Actions / Overall Adjustments (e.g. Auto-Enhance) */}
                  <div className="p-1">
                     <button className="w-full text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2.5 rounded-lg flex items-center justify-center space-x-1.5">
                        <i className="ri-magic-line"></i>
                        <span>Auto-Enhance Visuals (AI)</span>
                      </button>
                  </div>

                  {/* Applied Effects Section */}
                  <div className="space-y-3 flex-1 overflow-y-auto -mr-4 pr-3 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                    <h4 className="text-md text-white font-medium mb-2 sticky top-0 bg-gray-800 py-2 -mx-1 px-1 z-[5]">Applied Visual Effects</h4>
                    {appliedVisualEffects.length > 0 ? appliedVisualEffects.map(effect => (
                      <div key={effect.id} className={`p-3 rounded-lg ${selectedEffectId === effect.id ? 'bg-primary/10 ring-1 ring-primary' : 'bg-gray-900/60 hover:bg-gray-900/90'}`}>
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setSelectedEffectId(prev => prev === effect.id && effect.isEnabled ? null : effect.id)} // Toggle selection
                        >
                          <div>
                            <span className="text-sm font-medium text-white truncate" title={effect.name}>{effect.name}</span>
                            <span className="ml-2 text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-400 capitalize">{effect.type.replace('-',' ')}</span>
                          </div>
                          <label className="custom-switch small">
                            <input type="checkbox" checked={effect.isEnabled} onChange={() => handleToggleVisualEffect(effect.id)} />
                            <span className="switch-slider"></span>
                          </label>
                        </div>
                        {/* Placeholder for effect properties editor */}
                        {selectedEffectId === effect.id && (
                           <div className="mt-2 pt-2 border-t border-gray-700/50">
                             <p className="text-xs text-gray-400">Adjust {effect.name} properties here...</p>
                             {/* Example: Intensity slider for filters */}
                             {effect.type === 'filter' && effect.properties.intensity !== undefined && (
                               <div className="mt-1">
                                 <label className="text-xs text-gray-500">Intensity: {Math.round(effect.properties.intensity * 100)}%</label>
                                 <input type="range" min="0" max="1" step="0.01" value={effect.properties.intensity} onChange={(e) => console.log('Intensity changed', e.target.value)} className="w-full custom-range custom-range-sm" />
                               </div>
                             )}
                           </div>
                        )}
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 text-center py-4">No visual effects applied yet.</p>
                    )}
                    <div className="mt-3 flex gap-2">
                        <button 
                          onClick={() => setShowFilterGallery(true)}
                          className="flex-1 text-sm bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5"
                        >
                          <i className="ri-camera-lens-line"></i>
                          <span>Add Filter</span>
                        </button>
                         <button 
                          onClick={() => console.log("Open Color Correction Panel")}
                          className="flex-1 text-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5"
                        >
                          <i className="ri-contrast-2-line"></i>
                          <span>Color Correct</span>
                        </button>
                        <button 
                          onClick={() => setShowOverlayLibrary(true)}
                          className="flex-1 text-sm bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5"
                        >
                          <i className="ri-stack-line"></i>
                          <span>Add Overlay</span>
                        </button>
                    </div>
                  </div>

                  {/* AI Visual Suggestions */}
                  <div className="pt-2">
                    <h4 className="text-md text-white font-medium mb-2">AI Visual Recommendations</h4>
                    {aiVisualSuggestions.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-2">
                        {aiVisualSuggestions.map(sugg => (
                          <div key={sugg.id} className="bg-gray-900/60 hover:bg-gray-900/90 p-2.5 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <i className={`${sugg.icon} text-primary text-xl`}></i>
                              <div className="text-xs">
                                <p className="text-gray-300">{sugg.description}</p>
                                {sugg.timeCue && <p className="text-gray-500">Time: {sugg.timeCue}</p>}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {sugg.previewImageUrl && (
                                <button 
                                  onClick={() => console.log('Preview AI visual suggestion:', sugg.previewImageUrl)} 
                                  className="p-1.5 text-gray-400 hover:text-white text-xs" title="Preview Suggestion"
                                >
                                  <i className="ri-eye-line"></i>
                                </button>
                              )}
                              <button 
                                onClick={() => handleApplyAiVisualSuggestion(sugg)}
                                className="px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No AI visual recommendations currently.</p>
                    )}
                  </div>

                  {/* Placeholder for Filter Gallery Modal */}
                  {showFilterGallery && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg text-white font-medium mb-4">Filter Gallery (Placeholder)</h3>
                        <p className="text-gray-400 mb-4">Browse and select visual filters.</p>
                        {/* Example filters */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {['vintage-film', 'moody-blue', 'warm-glow', 'black-white-high-contrast'].map(f => (
                            <button key={f} onClick={() => handleAddFilter(f)} className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-white text-sm">{f.replace('-',' ')}</button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setShowFilterGallery(false)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg w-full"
                        >
                          Close Gallery
                        </button>
                      </div>
                    </div>
                  )}
                   {/* Placeholder for Overlay Library Modal */}
                  {showOverlayLibrary && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg text-white font-medium mb-4">Overlay Library (Placeholder)</h3>
                        <p className="text-gray-400 mb-4">Browse and select overlays (e.g., light leaks, textures).</p>
                        <button onClick={() => handleAddOverlay('/overlays/light_leak_01.png')} className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-white text-sm w-full mb-2">Add Example Light Leak</button>
                        <button 
                          onClick={() => setShowOverlayLibrary(false)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg w-full"
                        >
                          Close Library
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* B-Roll Tab UI (This is the original and correct one) */}
              {activeEditTab === 'b-roll' && (
                <div className="space-y-6 h-full flex flex-col">
                  {/* Sticky Header */}
                  <div className="flex items-center justify-between sticky top-0 bg-gray-800 py-3 px-4 -mx-4 -mt-4 z-10 border-b border-gray-700">
                    <h3 className="text-lg text-white font-medium">B-Roll Manager</h3>
                     <button 
                      onClick={() => console.log("B-Roll settings/help")}
                      className="text-gray-400 hover:text-white"
                    >
                      <i className="ri-settings-3-line"></i>
                    </button>
                  </div>

                  {/* Action Buttons: Add from Library & Upload */}
                  <div className="grid grid-cols-2 gap-3 p-1">
                    <button 
                      onClick={() => handleOpenBRollLibrary()}
                      className="w-full text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2.5 rounded-lg flex items-center justify-center space-x-1.5"
                    >
                      <i className="ri-vidicon-line"></i>
                      <span>Browse B-Roll Library</span>
                    </button>
                    <button 
                      onClick={handleUploadCustomBRoll}
                      className="w-full text-sm bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-2.5 rounded-lg flex items-center justify-center space-x-1.5"
                    >
                      <i className="ri-upload-cloud-2-line"></i>
                      <span>Upload Custom B-Roll</span>
                    </button> 
                  </div>

                  {/* AI B-Roll Suggestions */}
                  <div className="pt-1">
                    <h4 className="text-md text-white font-medium mb-2 px-1">AI B-Roll Suggestions</h4>
                    {aiBRollSuggestions.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 -mr-3 pr-3">
                        {aiBRollSuggestions.map(sugg => (
                          <div key={sugg.id} className="bg-gray-900/60 p-3 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <i className={`${sugg.icon} text-primary text-lg`}></i>
                                <p className="text-sm text-gray-300">{sugg.description}</p>
                              </div>
                               <button 
                                onClick={() => handleOpenBRollLibrary(sugg.keywords)}
                                className="text-xs text-primary hover:underline whitespace-nowrap ml-2"
                                title="Find similar in library"
                              >
                                Find More
                              </button>
                            </div>
                            {sugg.suggestedClips && sugg.suggestedClips.length > 0 && (
                              <div className="ml-6 mt-1 space-y-1.5">
                                {sugg.suggestedClips.slice(0,2).map((clip, idx) => (
                                  <div key={idx} className="bg-gray-800/70 hover:bg-gray-800 p-2 rounded flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2 truncate">
                                      {clip.thumbnailUrl && <img src={clip.thumbnailUrl} alt={clip.name || 'preview'} className="w-10 h-6 object-cover rounded-sm"/>}
                                      <span className="text-gray-300 truncate" title={clip.name}>{clip.name || 'Suggested Clip'} ({clip.duration}s)</span>
                                    </div>
                                    <button 
                                      onClick={() => handleAddBRollFromSuggestion(clip, sugg.timeCue)}
                                      className="px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs font-medium whitespace-nowrap"
                                    >
                                      Add to Timeline
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No AI B-Roll suggestions at the moment.</p>
                    )}
                  </div>

                  {/* Project B-Roll Clips List */}
                  <div className="flex-1 overflow-y-auto -mr-3 pr-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                    <h4 className="text-md text-white font-medium mb-2 sticky top-0 bg-gray-800 py-2 -mx-1 px-1 z-[5]">Project B-Roll Clips</h4>
                    {projectBRollClips.length > 0 ? (
                      <div className="space-y-2">
                        {projectBRollClips.map(clip => (
                          <div key={clip.id} className="bg-gray-900/60 hover:bg-gray-900/90 p-2.5 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-3 truncate">
                              {clip.thumbnailUrl && <img src={clip.thumbnailUrl} alt={clip.name} className="w-16 h-9 object-cover rounded"/>}
                              <div className="text-xs truncate">
                                <p className="text-white font-medium truncate" title={clip.name}>{clip.name}</p>
                                <p className="text-gray-400">Duration: {clip.duration}s{clip.startTimeInMainVideo !== undefined ? `, Starts at: ${formatTime(clip.startTimeInMainVideo)}` : ' (Not on timeline)'}</p>
                                <p className="text-gray-500 capitalize">Source: {clip.source.replace('-',' ')}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <button className="p-1.5 text-gray-400 hover:text-primary text-xs" title="Adjust on Timeline (Not Implemented)"><i className="ri-scissors-line"></i></button>
                              <button onClick={() => handleRemoveBRollClip(clip.id)} className="p-1.5 text-red-500 hover:text-red-400 text-xs" title="Remove from Project"><i className="ri-delete-bin-line"></i></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No B-Roll clips added to the project yet.</p>
                    )}
                  </div>

                  {/* Placeholder for B-Roll Library Modal (already exists below this, this is just to ensure structure) */}
                  {showBRollLibrary && (
                    // REMOVE THIS COMMENT: Modal content as previously defined ...
                    /* The actual modal is rendered later, this comment block was causing an error */
                    <></> // Using an empty fragment if the block must remain, or remove the block if not needed.
                  )}
                </div>
              )}

              <>
                {/* Thumbnail Generator Tab UI */}
                {activeEditTab === 'thumbnails' && (
                  <div className="space-y-6 h-full flex flex-col text-white">
                    {/* Sticky Header */}
                    <div className="flex items-center justify-between sticky top-0 bg-gray-800 py-3 px-4 -mx-4 -mt-4 z-10 border-b border-gray-700">
                      <h3 className="text-lg text-white font-medium">AI Thumbnail Generator</h3>
                      <button
                        onClick={() => console.log('Generate More Thumbnails clicked')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs transition-colors duration-150"
                      >
                        <i className="ri-refresh-line"></i>
                        <span>Generate More</span>
                      </button>
                    </div>

                    {/* Main Recommended Thumbnail */}
                    <div 
                      className="mb-1 px-1 relative" 
                      ref={thumbnailPreviewRef} 
                      onMouseMove={handleStickerDrag}
                      onMouseUp={handleStickerDragEnd}
                      onMouseLeave={handleStickerDragEnd} // End drag if mouse leaves preview area
                    >
                      <div className="relative group aspect-[16/9]">
                        <img
                          src={mainThumbnail.src}
                          alt="Main thumbnail preview"
                          className="w-full h-full object-cover rounded-lg shadow-lg"
                          style={{
                            filter: `brightness(${mainThumbnail.brightness}%) contrast(${mainThumbnail.contrast}%)`
                          }}
                        />
                        <div
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-lg z-30" // MODIFIED: Added z-30
                        >
                          <button
                            title="Edit Image (AI)"
                            onClick={() => console.log("AI Edit Image clicked")}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white"
                          >
                            <i className="ri-image-edit-line"></i>
                          </button>
                          <button
                            title="Customize Text"
                            onClick={() => {
                              setShowTitleStyleEditor(!showTitleStyleEditor);
                              // If opening editor, also ensure current title is in editable state
                              if (!showTitleStyleEditor) {
                                setEditableThumbnailTitle(mainThumbnail.title);
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            title="AI Magic (More Options)"
                            onClick={() => console.log("AI Magic clicked")}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white"
                          >
                            <i className="ri-magic-line"></i>
                          </button>
                        </div>
                        {/* Editable Text Overlay */}
                        <div
                          className="absolute inset-0 flex items-center justify-center pointer-events-none px-6 z-20" // MODIFIED: Added z-20
                        >
                          <div
                            className="relative group/text w-full cursor-text pointer-events-auto"
                            onClick={() => {
                              if (!isEditingThumbnailTitle) {
                                setEditableThumbnailTitle(mainThumbnail.title); // Sync before editing
                                setIsEditingThumbnailTitle(true);
                              }
                            }}
                          >
                            {isEditingThumbnailTitle ? (
                              <input
                                type="text"
                                value={editableThumbnailTitle}
                                onChange={(e) => setEditableThumbnailTitle(e.target.value)}
                                onBlur={() => {
                                  setIsEditingThumbnailTitle(false);
                                  setMainThumbnail(prev => ({...prev, title: editableThumbnailTitle}));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setIsEditingThumbnailTitle(false);
                                    setMainThumbnail(prev => ({...prev, title: editableThumbnailTitle}));
                                  }
                                }}
                                className={`w-full font-black text-white leading-tight uppercase bg-transparent border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 p-2 text-${thumbnailTitleAlign}`}
                                style={{ 
                                  fontSize: `${thumbnailTitleSize}rem`, 
                                  // textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' // REMOVED old hardcoded
                                  ...mainThumbnail.titleStyle // ENSURED this is spread
                                }}
                                autoFocus
                              />
                            ) : (
                              <h3
                                className={`font-black text-white leading-tight uppercase break-words text-${thumbnailTitleAlign}`}
                                style={{
                                  fontSize: `${thumbnailTitleSize}rem`,
                                  // textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' // REMOVED old hardcoded
                                  ...mainThumbnail.titleStyle // ENSURED this is spread
                                }}
                              >
                                {mainThumbnail.title}
                              </h3>
                            )}
                            {/* Placeholder for inline text editing tools on hover (font size, color etc) */}
                          </div>
                        </div>

                        {/* Render Active Stickers - z-index is handled per sticker (z-10 or z-20 when dragging) */}
                        {activeStickers.map(sticker => (
                          <div 
                            key={sticker.id} 
                            className={`sticker-item absolute cursor-grab group/sticker ${draggingSticker?.id === sticker.id ? 'cursor-grabbing z-20 brightness-90' : 'z-10'}`}
                            style={{
                              top: `${sticker.y}%`,
                              left: `${sticker.x}%`,
                              transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                              // width: '64px', // Example base width, consider making this dynamic or part of sticker state
                              // height: '64px',// Example base height
                            }}
                            onMouseDown={(e) => handleStickerDragStart(e, sticker.id)}
                          >
                            <img 
                              src={sticker.src}
                              alt={sticker.alt}
                              className="pointer-events-none w-16 h-16 object-contain" // Applied fixed size here
                            />
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemoveSticker(sticker.id); }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/sticker:opacity-100 hover:bg-red-700 transition-all duration-150 text-xs z-30 shadow-md"
                              title="Remove sticker"
                            >
                              <i className="ri-close-line leading-none"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Thumbnail Options */}
                    <div className="grid grid-cols-3 gap-2 px-1">
                      {alternativeThumbnails.map(altThumb => (
                        <div 
                          key={altThumb.id} 
                          className="relative group cursor-pointer aspect-video rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-150"
                          onClick={() => setMainThumbnail(prev => ({...prev, src: altThumb.src, id: altThumb.id}))}
                        >
                          <img
                            src={altThumb.src}
                            alt={`Alternative thumbnail ${altThumb.id}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div
                            className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <i className="ri-check-line text-white text-2xl"></i>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Style Editor Panel (conditionally rendered) */}
                    {showTitleStyleEditor && (
                      <div className="mt-1 p-3 bg-gray-900/50 rounded-lg space-y-3 border border-gray-700">
                        <h4 className="text-sm text-gray-300 mb-1">Title Suggestions & Styles</h4>
                         {/* Font Styles Placeholder */}
                        <div className="space-y-2">
                          <h4 className="text-sm text-gray-400 mb-1">Font Styles</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <button className="px-3 py-1.5 bg-gray-700 rounded text-white text-sm font-black uppercase hover:bg-gray-600">Impact Style</button>
                            <button className="px-3 py-1.5 bg-gray-700 rounded text-white text-sm font-bold italic hover:bg-gray-600">Dynamic Bold</button>
                          </div>
                        </div>
                        {/* Title Suggestions Placeholder */}
                        <div className="space-y-2">
                          <h4 className="text-sm text-gray-400 mb-1">Trending Titles</h4>
                          <button className="w-full text-left px-3 py-1.5 text-sm font-black text-white hover:bg-gray-700 rounded uppercase">*SHOCKING* AI Changes Everything!</button>
                          <button className="w-full text-left px-3 py-1.5 text-sm font-black text-white hover:bg-gray-700 rounded uppercase">AI Secrets REVEALED!</button>
                        </div>
                        {/* AI Generated Stickers Placeholder */}
                        <div className="space-y-2">
                          <h4 className="text-sm text-gray-400 mb-1">AI Generated Stickers</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {[1,2,3,4].map(i => (
                               <div key={i} className="aspect-square bg-gray-700 rounded-lg p-1 hover:bg-gray-600 cursor-pointer flex items-center justify-center">
                                 <i className="ri-user-smile-line text-gray-500 text-xl"></i>
                               </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setShowTitleStyleEditor(false)} className="text-xs text-gray-400 hover:text-white mt-2">Close Editor</button>
                      </div>
                    )}

                    {/* Advanced Style Controls - Reordered and with Collapsible Image Adjustments */}
                    <div className="mt-1 space-y-3 px-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pb-2">
                      {/* Text Styling (Size/Align) - Collapsible */}
                      <div className="space-y-2">
                         <button 
                          onClick={() => setTextStylingCollapsed(!textStylingCollapsed)}
                          className="flex items-center justify-between w-full text-left py-1 focus:outline-none"
                        >
                          <h4 className="text-sm text-gray-300">Text Styling</h4>
                          <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${textStylingCollapsed ? '' : 'rotate-180'}`}></i>
                        </button>
                        {!textStylingCollapsed && (
                          <div className="pt-1 space-y-2 pl-1 pr-1">
                            {/* Text Size Control */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Text Size</span>
                              <input
                                type="range" min="1" max="8" step="0.1" value={thumbnailTitleSize} // Adjusted min/max for more range
                                onChange={(e) => setThumbnailTitleSize(parseFloat(e.target.value))}
                                className="w-32 custom-range custom-range-sm"
                              />
                              <span className="text-xs text-gray-400 w-12 text-right">{thumbnailTitleSize.toFixed(1)}rem</span>
                            </div>
                            {/* Text Align Control */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Alignment</span>
                              <div className="flex space-x-1">
                                {[{icon: 'ri-align-left', value: 'left'}, {icon: 'ri-align-center', value: 'center'}, {icon: 'ri-align-right', value: 'right'}].map(align => (
                                  <button 
                                    key={align.value} 
                                    onClick={() => setThumbnailTitleAlign(align.value)}
                                    className={`p-1.5 rounded transition-colors duration-150 ${thumbnailTitleAlign === align.value ? 'bg-primary text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                    title={`Align ${align.value}`}
                                  >
                                    <i className={align.icon}></i>
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Text Position Control (X and Y) */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Position X</span>
                              <input
                                type="range" min="0" max="100" step="1" value={thumbnailTitlePosition.x}
                                onChange={(e) => setThumbnailTitlePosition(prev => ({...prev, x: parseInt(e.target.value)}))}
                                className="w-32 custom-range custom-range-sm"
                              />
                              <span className="text-xs text-gray-400 w-12 text-right">{thumbnailTitlePosition.x}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Position Y</span>
                              <input
                                type="range" min="0" max="100" step="1" value={thumbnailTitlePosition.y}
                                onChange={(e) => setThumbnailTitlePosition(prev => ({...prev, y: parseInt(e.target.value)}))}
                                className="w-32 custom-range custom-range-sm"
                              />
                              <span className="text-xs text-gray-400 w-12 text-right">{thumbnailTitlePosition.y}%</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Text Effects - Collapsible (Remains open by default) */}
                      <div className="space-y-2">
                        <button 
                          onClick={() => setTextEffectsCollapsed(!textEffectsCollapsed)}
                          className="flex items-center justify-between w-full text-left py-1 focus:outline-none"
                        >
                          <h4 className="text-sm text-gray-300">Text Effects</h4>
                          <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${textEffectsCollapsed ? '' : 'rotate-180'}`}></i>
                        </button>
                        {!textEffectsCollapsed && (
                          <div className="pt-1 space-y-2 pl-1 pr-1">
                            <div className="grid grid-cols-3 gap-2">
                              {Object.entries(thumbnailTextEffects).map(([effectName, effectStyle]) => (
                                <button
                                  key={effectName}
                                  onClick={() => {
                                    setSelectedTextEffect(effectName);
                                    setMainThumbnail(prev => {
                                      // Start with the existing titleStyle to preserve font family, etc.
                                      const newTitleStyle: React.CSSProperties = { ...prev.titleStyle };

                                      // Reset properties that might conflict or should be exclusively set by the new effect
                                      if (effectName !== 'None') { // 'None' effect mostly uses existing/base shadows
                                          newTitleStyle.textShadow = undefined; 
                                          newTitleStyle.backgroundImage = undefined;
                                          newTitleStyle.WebkitBackgroundClip = undefined;
                                          newTitleStyle.backgroundClip = undefined;
                                          newTitleStyle.WebkitTextFillColor = undefined;
                                          newTitleStyle.WebkitTextStroke = undefined;
                                          newTitleStyle.paintOrder = undefined;
                                          newTitleStyle.color = undefined; // allow effectStyle to set color
                                      }
                                      
                                      // Merge the new effect's style
                                      // For 'None', effectStyle itself contains the desired shadow and resets
                                      Object.assign(newTitleStyle, effectStyle); 

                                      return {
                                        ...prev,
                                        titleStyle: newTitleStyle
                                      };
                                    });
                                  }}
                                  className={`p-2.5 rounded text-xs transition-colors duration-150 truncate h-12 flex items-center justify-center font-bold ${selectedTextEffect === effectName ? 'bg-primary text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-primary' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                                  style={{
                                    ...effectStyle, 
                                    fontFamily: mainThumbnail.titleStyle.fontFamily || 'Inter, sans-serif', // Ensure button preview uses current font
                                    fontWeight: mainThumbnail.titleStyle.fontWeight || 'bold', // Ensure button preview uses current font weight
                                    textTransform: (mainThumbnail.titleStyle.textTransform || 'uppercase') as React.CSSProperties['textTransform'] // Ensure button preview uses current text transform
                                  }} 
                                  title={effectName}
                                >
                                  {/* Apply a more generic style to the inner span if complex effect styles break button text too much */}
                                  <span style={{ fontSize: '0.75rem', mixBlendMode: 'difference' }}>{effectName}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Layout - Collapsible (Restoring this section, defaults to collapsed) */}
                      <div className="space-y-2">
                        <button 
                          onClick={() => setLayoutCollapsed(!layoutCollapsed)}
                          className="flex items-center justify-between w-full text-left py-1 focus:outline-none"
                        >
                          <h4 className="text-sm text-gray-300">Layout</h4>
                          <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${layoutCollapsed ? '' : 'rotate-180'}`}></i>
                        </button>
                        {!layoutCollapsed && (
                          <div className="pt-1 space-y-2 pl-1 pr-1">
                            <div className="grid grid-cols-2 gap-2">
                              {['Left Split', 'Right Split', 'Top Banner', 'Bottom Banner'].map(layout => (
                                <button
                                  key={layout}
                                  onClick={() => setSelectedLayout(layout)}
                                  className={`p-2 rounded text-xs transition-colors duration-150 flex items-center justify-center space-x-1 truncate ${selectedLayout === layout ? 'bg-primary text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                >
                                  {/* Basic icons, can be improved */}
                                  {layout.includes('Left') && <i className="ri-layout-left-line"></i>}
                                  {layout.includes('Right') && <i className="ri-layout-right-line"></i>}
                                  {layout.includes('Top') && <i className="ri-layout-top-line"></i>}
                                  {layout.includes('Bottom') && <i className="ri-layout-bottom-line"></i>}
                                  <span>{layout}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stickers Section - Collapsible - MODIFIED */}
                      <div className="space-y-2">
                        <button 
                          onClick={() => setStickersSectionCollapsed(!stickersSectionCollapsed)}
                          className="flex items-center justify-between w-full text-left py-1 focus:outline-none"
                        >
                          <h4 className="text-sm text-gray-300">Stickers</h4>
                          <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${stickersSectionCollapsed ? '' : 'rotate-180'}`}></i>
                        </button>
                        {!stickersSectionCollapsed && (
                          <div className="pt-1 space-y-3 pl-1 pr-1">
                            <div>
                              <h5 className="text-xs text-gray-400 mb-1.5 font-medium">AI Generated (from Video)</h5>
                              <div className="grid grid-cols-4 gap-2 mb-3">
                                {sampleStickers.slice(0, 4).map(sticker => ( // Placeholder: first 4 as generated
                                  <button
                                    key={`gen-${sticker.id}`}
                                    onClick={() => handleAddStickerToThumbnail(sticker)}
                                    className="aspect-square bg-gray-700 rounded-lg p-1 hover:bg-gray-600 cursor-pointer flex items-center justify-center overflow-hidden ring-1 ring-transparent hover:ring-primary transition-all duration-150"
                                    title={`Add ${sticker.alt} sticker`}
                                  >
                                    <img src={sticker.src} alt={sticker.alt} className="w-full h-full object-contain" />
                                  </button>
                                ))}
                                {sampleStickers.slice(0,4).length === 0 && <p className="col-span-4 text-center text-xs text-gray-500 py-2">No AI stickers generated yet.</p>}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-xs text-gray-400 mb-1.5 font-medium">Suggested Stickers</h5>
                              <div className="grid grid-cols-4 gap-2">
                                {sampleStickers.slice(0, 4).map(sticker => ( // Placeholder: can be a different set or all
                                  <button
                                    key={`sug-${sticker.id}`}
                                    onClick={() => handleAddStickerToThumbnail(sticker)}
                                    className="aspect-square bg-gray-700 rounded-lg p-1 hover:bg-gray-600 cursor-pointer flex items-center justify-center overflow-hidden ring-1 ring-transparent hover:ring-primary transition-all duration-150"
                                    title={`Add ${sticker.alt} sticker`}
                                  >
                                    <img src={sticker.src} alt={sticker.alt} className="w-full h-full object-contain" />
                                  </button>
                                ))}
                              </div>
                            </div>
                            {activeStickers.length > 0 && (
                              <button
                                onClick={() => setActiveStickers([])}
                                className="w-full mt-3 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1.5 rounded"
                              >
                                Clear All Stickers
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Image Adjustments - Collapsible (defaults to collapsed) */}
                      <div className="space-y-2">
                        <button 
                          onClick={() => setImageAdjustmentsCollapsed(!imageAdjustmentsCollapsed)}
                          className="flex items-center justify-between w-full text-left py-1 focus:outline-none"
                        >
                          <h4 className="text-sm text-gray-300">Image Adjustments</h4>
                          <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${imageAdjustmentsCollapsed ? '' : 'rotate-180'}`}></i>
                        </button>
                        {!imageAdjustmentsCollapsed && (
                          <div className="pt-1 space-y-2 pl-1 pr-1">
                            {/* Restoring Brightness, Contrast controls */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Brightness</span>
                              <input
                                type="range" min="0" max="200" value={mainThumbnail.brightness}
                                onChange={(e) => setMainThumbnail(prev => ({...prev, brightness: parseInt(e.target.value)}))}
                                className="w-32 custom-range custom-range-sm"
                              />
                              <span className="text-xs text-gray-400 w-8 text-right">{mainThumbnail.brightness}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Contrast</span>
                              <input
                                type="range" min="0" max="200" value={mainThumbnail.contrast}
                                onChange={(e) => setMainThumbnail(prev => ({...prev, contrast: parseInt(e.target.value)}))}
                                className="w-32 custom-range custom-range-sm"
                              />
                              <span className="text-xs text-gray-400 w-8 text-right">{mainThumbnail.contrast}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>

              {/* Placeholder for UNIMPLEMENTED tabs */}
              {(activeEditTab === 'transitions' || activeEditTab === 'text-graphics' || activeEditTab === 'angles') && (
                <div className="flex items-center justify-center h-[50vh] text-gray-500">
                  <div className="text-center">
                    <i className={`ri-${
                      activeEditTab === 'transitions' ? 'transition-line' :
                      activeEditTab === 'text-graphics' ? 'text-wrap' :
                      'camera-switch-line' 
                    } text-4xl mb-2`}></i>
                    <h3 className="text-lg font-medium mb-2">
                      {activeEditTab === 'transitions' ? 'Transitions' :
                       activeEditTab === 'text-graphics' ? 'Text & Graphics' :
                       activeEditTab === 'angles' ? 'Multi-Angle' : 'Tools'}
                    </h3>
                    <p className="text-sm">This panel will be implemented in future updates.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-3">
              <div className="flex justify-between">
                <button onClick={handleSaveDraft} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm flex items-center">
                  <i className="ri-save-line mr-1.5"></i> Save Draft
                </button>
                <button onClick={handleExport} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                  <i className="ri-download-line mr-1.5"></i> Export Video
                </button>
              </div>
            </div>

            {/* Source Manager - Added if in edit mode, shows below the editing panel on smaller screens or right side on larger screens */}
            {editMode && activeEditTab !== 'tools' && (
              <div className="border-t lg:border-t-0 lg:border-l border-gray-700 bg-gray-900 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Source Assets</h3>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white">
                    <i className="ri-add-line"></i>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
                  {(['all', 'video', 'audio', 'images'] as SourceFilter[]).map(filter => (
                    <button 
                      key={filter}
                      onClick={() => handleSourceFilterChange(filter)}
                      className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                        sourceFilter === filter 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                  {[
                    { id: 'main', name: "Main Camera", type: "Primary video", duration: "1:02:15", img: "https://readdy.ai/api/search-image?query=podcast%20recording%2C%20main%20camera%20angle%2C%20wide%20shot%20of%20two%20hosts&width=160&height=90&seq=8&orientation=landscape" },
                    { id: 'host1', name: "Host 1 Closeup", type: "Angle 2", duration: "1:02:15", img: "https://readdy.ai/api/search-image?query=podcast%20recording%2C%20close%20up%20angle%20of%20host%201%2C%20professional%20lighting&width=160&height=90&seq=9&orientation=landscape" },
                    { id: 'host2', name: "Host 2 Closeup", type: "Angle 3", duration: "1:02:15", img: "https://readdy.ai/api/search-image?query=podcast%20recording%2C%20close%20up%20angle%20of%20host%202%2C%20professional%20lighting&width=160&height=90&seq=10&orientation=landscape" },
                    { id: 'tech', name: "Tech B-Roll", type: "B-Roll", duration: "0:45", img: "https://readdy.ai/api/search-image?query=digital%20technology%20visualization%2C%20abstract%20AI%20concept%2C%20blue%20tones&width=160&height=90&seq=11&orientation=landscape" },
                    { id: 'audio', name: "Clean Audio", type: "Main Audio", duration: "1:02:15", icon: "ri-volume-up-line" },
                    { id: 'music', name: "Background Music", type: "Audio", duration: "3:20", icon: "ri-music-line" }
                  ]
                    // Filter sources based on the selected filter
                    .filter(source => {
                      if (sourceFilter === 'all') return true;
                      if (sourceFilter === 'audio') return source.id === 'audio' || source.id === 'music';
                      if (sourceFilter === 'video') return source.id !== 'audio' && source.id !== 'music';
                      return source.id === 'tech'; // 'images' filter would show only b-roll/images
                    })
                    .map(source => (
                    <div 
                      key={source.id} 
                      className="source-item bg-gray-800 rounded overflow-hidden cursor-pointer hover:shadow-lg" 
                      onClick={() => handleSourceAssetClick(source.id)}
                    >
                      <div className="relative aspect-video">
                        {source.img ? (
                          <img src={source.img} alt={source.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <i className={`${source.icon} text-gray-500 text-2xl`}></i>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
                            <i className="ri-play-fill"></i>
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <h4 className="text-sm text-white truncate">{source.name}</h4>
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500">{source.type}</p>
                          <p className="text-xs text-gray-500">{source.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* NEW: Floating Command Bar (Visible when !editMode) */}
      {!editMode && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl z-40 px-4"> {/* Changed bottom-20 to bottom-6 */}
          {/* Container for the main bar content */}
          <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50">
            {/* Command Input section */}
            <div className="p-3 border-b border-gray-700/50">
              {/* Wrapper for pill and input field */}
              <div className="relative flex items-center w-full bg-gray-800/60 rounded-xl border border-transparent focus-within:border-primary focus-within:ring-primary/50 focus-within:ring-1 transition-colors duration-200 pr-20"> {/* Added pr-20 for send button space */}
                <div className="absolute left-4 flex items-center space-x-2 pointer-events-none z-10"> {/* Ensure icon is above pill if overlapping */}
                  <i className="ri-magic-line text-primary"></i>
                </div>
                
                {/* Pill Display */}
                {activePill && (
                  <div className="pill-container group flex-shrink-0 ml-10 bg-primary/30 text-primary text-sm px-2 py-1 rounded-md flex items-center space-x-1.5 mx-1 my-1 max-w-xs">
                    <span className="truncate" title={
                      activePill.type === 'speaker' ? `@speaker:${activePill.display}` :
                      activePill.type === 'graphic' ? `@graphic:${activePill.display}` :
                      activePill.type === 'onScreenText' ? `@text:${activePill.display}` :
                      activePill.type === 'object' ? `@object:${activePill.display}` :
                      activePill.type === 'scene' ? `@scene:${activePill.display}` :
                      activePill.type === 'marker' ? `@marker:${activePill.display}` :
                      `@${activePill.time} (${activePill.display})`
                    }>
                      {
                        activePill.type === 'speaker' ? `@speaker:${activePill.display.substring(0,15)}${activePill.display.length > 15 ? '...':''}` :
                        activePill.type === 'graphic' ? `@graphic:${activePill.display.substring(0,15)}${activePill.display.length > 15 ? '...':''}` :
                        activePill.type === 'onScreenText' ? `@text:${activePill.display.substring(0,15)}${activePill.display.length > 15 ? '...':''}` :
                        activePill.type === 'object' ? `@object:${activePill.display.substring(0,15)}${activePill.display.length > 15 ? '...':''}` :
                        activePill.type === 'scene' ? `@scene:${activePill.display.substring(0,15)}${activePill.display.length > 15 ? '...':''}` :
                        activePill.type === 'marker' ? `@marker:${activePill.display.substring(0,15)}${activePill.display.length > 15 ? '...':''}` :
                        `@${activePill.time} (${activePill.display.substring(0,15)}${activePill.display.length > 15 ? '...':''})`
                      }
                    </span>
                    <button 
                      onClick={handleDismissPill} 
                      className="opacity-0 group-hover:opacity-100 text-primary hover:text-red-400 transition-opacity"
                      title="Remove timestamp"
                    >
                      <i className="ri-close-line ri-sm"></i>
                    </button>
                  </div>
                )}
                
                <input 
                  ref={commandInputRef}
                  type="text" 
                  value={commandActionText} // Use commandActionText
                  onChange={handleCommandInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommandSubmit();
                    // Handle backspace to dismiss pill if commandActionText is empty and a pill exists
                    if (e.key === 'Backspace' && commandActionText === '' && activePill) {
                      handleDismissPill();
                      e.preventDefault(); // Prevent default backspace action which might affect other things
                    }
                  }}
                  className={`command-actual-input flex-grow bg-transparent text-white py-2.5 rounded-xl outline-none ${activePill ? 'pl-1' : 'pl-10'}`} // Adjust left padding based on pill
                  placeholder={activePill ? ' Add details...' : 'Ask AI to perform quick actions...'}
                />
                
                {/* Send and Mic Buttons - absolutely positioned to the main wrapper */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                    <i className="ri-mic-line"></i>
                  </button>
                  <button 
                    onClick={handleCommandSubmit}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                  >
                    <i className="ri-send-plane-line"></i>
                  </button>
                </div>
              </div>
              
              {/* Timestamp Dropdown - positioned relative to the input section wrapper */}
              {showTimestampDropdown && (
                <div className="absolute z-50 bottom-full mb-1 w-[calc(100%-24px)] left-3 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-[300px] flex flex-col"> {/* Max height increased, flex col */}
                  {/* Quick Filter Buttons */}
                  <div className="p-2 border-b border-gray-700 flex flex-wrap gap-1 justify-center bg-gray-800 sticky top-0 z-10">
                    {([
                      {label: 'All', filter: 'all' as SuggestionType | 'all', icon: 'ri-list-check-2'},
                      {label: 'Time', filter: 'segment' as SuggestionType | 'all', icon: 'ri-time-line'}, // 'segment' acts as proxy for time-based
                      {label: 'Speaker', filter: 'speaker' as SuggestionType | 'all', icon: 'ri-user-voice-line'},
                      {label: 'Graphic', filter: 'graphic' as SuggestionType | 'all', icon: 'ri-image-line'},
                      {label: 'Text', filter: 'onScreenText' as SuggestionType | 'all', icon: 'ri-font-size'},
                      {label: 'Object', filter: 'object' as SuggestionType | 'all', icon: 'ri-focus-3-line'},
                      {label: 'Scene', filter: 'scene' as SuggestionType | 'all', icon: 'ri-landscape-line'},
                      {label: 'Marker', filter: 'marker' as SuggestionType | 'all', icon: 'ri-price-tag-3-line'},
                    ] as {label: string; filter: SuggestionType | 'all'; icon: string}[]).map(btn => (
                      <button 
                        key={btn.label}
                        onClick={() => handleQuickFilterClick(btn.filter)}
                        className={`px-2.5 py-1 text-xs rounded-md flex items-center space-x-1 transition-colors duration-150 
                                      ${activeSuggestionCategoryFilter === btn.filter 
                                        ? 'bg-primary text-white' 
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                        title={`Filter by ${btn.label}`}
                      >
                        <i className={btn.icon}></i>
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-gray-800/50 flex-grow">
                    {filteredSuggestions.length > 0 ? ( 
                      <ul>
                        {filteredSuggestions.map((suggestion) => (
                          <li 
                            key={suggestion.id}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="px-3 py-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-b-0"
                          >
                            <div className="flex items-center">
                              {suggestion.type === 'speaker' ? (
                                <i className="ri-user-voice-line text-primary mr-2"></i>
                              ) : suggestion.type === 'graphic' ? (
                                <i className="ri-image-line text-green-400 mr-2"></i>
                              ) : suggestion.type === 'onScreenText' ? (
                                <i className="ri-font-size text-yellow-400 mr-2"></i>
                              ) : suggestion.type === 'object' ? (
                                <i className="ri-focus-3-line text-blue-400 mr-2"></i>
                              ) : suggestion.type === 'scene' ? (
                                <i className="ri-landscape-line text-purple-400 mr-2"></i>
                              ) : suggestion.type === 'marker' ? (
                                <i className="ri-price-tag-3-line text-red-400 mr-2"></i>
                              ) : (
                                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded font-mono w-16 text-center">{suggestion.time}</span>
                              )}
                              <span className={`ml-1 text-gray-300 font-medium`}>{suggestion.display}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 pl-1">{suggestion.desc}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-3 py-2 text-gray-400 text-sm">No matching suggestions found</div>
                    )}
                    {/* Removed hint text from here */}
                  </div>
                </div>
              )}
            </div>
            {/* Instructional text moved here, below the command input bar */}
            { !showTimestampDropdown && !simulationStatus && (
              <div className="pt-1 px-3 text-xs text-gray-500">
                Type after @ to filter (e.g., @speaker:Name, @segment:Intro) or click a suggestion to select.
              </div>
            )}
            {/* Simulation Status Display */}
            { simulationStatus && (
              <div className="pt-1 px-3 text-xs text-cyan-400 animate-pulse">
                {simulationStatus}
              </div>
            )}
            {/* Quick Actions */}
            <div className="px-3 py-2 flex items-center justify-center space-x-1 overflow-x-auto">
              {[ 
                { label: "Shorten This Part", icon: "ri-scissors-cut-line", onClick: handleShortenThisPart },
                { label: "Add Text On Screen", icon: "ri-text-spacing" },
                { label: "Add Related Visuals", icon: "ri-movie-line" },
                { label: "Improve Sound", icon: "ri-sound-module-line" },
                { label: "Auto-Enhance Clip", icon: "ri-magic-line" }
              ].map(action => (
                <button 
                  key={action.label}
                  onClick={action.onClick || (() => console.log(`${action.label} quick action clicked`))}
                  className="flex items-center space-x-1.5 bg-gray-800/70 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors duration-150"
                >
                  <i className={action.icon}></i>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
            
            {/* Command History Section */}
            {commandHistory.length > 0 && (
              <div className="history-section pt-2 px-3 pb-2 border-t border-gray-700/50 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">History</h4>
                  <button 
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    className="text-xs text-primary hover:underline"
                  >
                    {isHistoryExpanded ? 'Show Less' : `Show More (${commandHistory.length})`}
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHistoryExpanded ? 'max-h-48' : 'max-h-16'}`}>
                  <ul className={`space-y-1 text-xs ${isHistoryExpanded ? 'overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent pr-1' : ''}`}>
                    {(isHistoryExpanded ? commandHistory : commandHistory.slice(0, 3)).map((item) => (
                      <li 
                        key={item.id} 
                        className={`flex justify-between items-center group ${item.undone ? 'opacity-50' : ''}`}
                        title={item.result}
                      >
                        <span className={`truncate ${item.undone ? 'line-through text-gray-600' : 'text-gray-500'}`}>
                          <i className={`ri-check-line mr-1 ${item.undone ? 'text-gray-600' : 'text-green-500'}`}></i> 
                          {item.result.replace('SIMULATED: ', '')}
                        </span>
                        {!item.undone && (
                          <button 
                            onClick={() => handleUndoAction(item.id)}
                            className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-[11px]"
                            title="Undo this action (simulated)"
                          >
                            Undo
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Assistant Button - ensure z-index is high enough */}
      <div onClick={() => console.log('AI Assistant Clicked')} className="ai-assistant-button group w-14 h-14 flex items-center justify-center rounded-full bg-primary shadow-lg cursor-pointer z-30">
        <i className="ri-robot-line ri-lg text-white"></i>
         {/* AI Assistant Tooltip - Appears when hovering over the AI Assistant button */}
         <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-white p-3 rounded-lg shadow-xl text-sm">
            Need help? Click to chat with your AI assistant about editing this video.
        </div>
      </div>
    </main>
  );
} 