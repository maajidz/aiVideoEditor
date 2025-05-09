"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for clips library
const clipsData = [
  {
    id: 'clip1',
    title: 'Master Aperture Settings in 60 Seconds',
    thumbnail: 'https://novocabs.com/api/search-image?query=camera%20aperture%20close%20up%2C%20DSLR%20lens%20settings%2C%20shallow%20depth%20of%20field&width=360&height=202&seq=560&orientation=landscape',
    projectId: '123456',
    projectTitle: 'Ultimate Guide to Camera Settings',
    duration: '60s',
    createdAt: '2023-05-01T15:30:00Z',
    platform: 'Instagram',
    views: 1250,
    engagement: 'high',
    published: true
  },
  {
    id: 'clip2',
    title: 'The 3 Most Important Camera Settings',
    thumbnail: 'https://novocabs.com/api/search-image?query=camera%20settings%20dial%2C%20person%20adjusting%20DSLR%20camera%2C%20photography%20basics&width=360&height=202&seq=561&orientation=landscape',
    projectId: '123456',
    projectTitle: 'Ultimate Guide to Camera Settings',
    duration: '45s',
    createdAt: '2023-05-01T15:40:00Z',
    platform: 'YouTube',
    views: 850,
    engagement: 'medium',
    published: true
  },
  {
    id: 'clip3',
    title: 'Why Your Photos Are Too Dark',
    thumbnail: 'https://novocabs.com/api/search-image?query=camera%20shutter%20speed%20settings%2C%20dark%20photo%20example%2C%20photography%20troubleshooting&width=360&height=202&seq=562&orientation=landscape',
    projectId: '123456',
    projectTitle: 'Ultimate Guide to Camera Settings',
    duration: '30s',
    createdAt: '2023-05-01T15:50:00Z',
    platform: 'Instagram',
    views: 2100,
    engagement: 'high',
    published: true
  },
  {
    id: 'clip4',
    title: 'ISO Explained Simply',
    thumbnail: 'https://novocabs.com/api/search-image?query=camera%20ISO%20settings%2C%20low%20light%20photography%2C%20digital%20camera%20sensor&width=360&height=202&seq=563&orientation=landscape',
    projectId: '123456',
    projectTitle: 'Ultimate Guide to Camera Settings',
    duration: '50s',
    createdAt: '2023-05-01T16:00:00Z',
    platform: 'TikTok',
    views: 3500,
    engagement: 'high',
    published: true
  },
  {
    id: 'clip5',
    title: '3 Presets for Sunset Photos',
    thumbnail: 'https://novocabs.com/api/search-image?query=sunset%20photography%20beautiful%20orange%20sky%20silhouette%20landscape&width=360&height=202&seq=564&orientation=landscape',
    projectId: '123457',
    projectTitle: 'Top 10 Lightroom Presets for Landscape Photography',
    duration: '45s',
    createdAt: '2023-04-28T12:30:00Z',
    platform: 'Instagram',
    views: 1800,
    engagement: 'medium',
    published: true
  },
  {
    id: 'clip6',
    title: 'Make Your Blue Skies Pop',
    thumbnail: 'https://novocabs.com/api/search-image?query=landscape%20photography%20dramatic%20blue%20sky%20clouds%20mountains&width=360&height=202&seq=565&orientation=landscape',
    projectId: '123457',
    projectTitle: 'Top 10 Lightroom Presets for Landscape Photography',
    duration: '35s',
    createdAt: '2023-04-28T12:45:00Z',
    platform: 'YouTube',
    views: 950,
    engagement: 'low',
    published: false
  },
  {
    id: 'clip7',
    title: 'Product Photography Lighting Setup',
    thumbnail: 'https://novocabs.com/api/search-image?query=product%20photography%20studio%20lighting%20setup%20professional%20equipment&width=360&height=202&seq=566&orientation=landscape',
    projectId: '123459',
    projectTitle: 'Behind the Scenes: Product Photoshoot',
    duration: '60s',
    createdAt: '2023-04-22T18:30:00Z',
    platform: 'YouTube',
    views: 1450,
    engagement: 'medium',
    published: true
  },
  {
    id: 'clip8',
    title: 'Rule of Thirds Explained',
    thumbnail: 'https://novocabs.com/api/search-image?query=rule%20of%20thirds%20photography%20composition%20grid%20example&width=360&height=202&seq=567&orientation=landscape',
    projectId: '123460',
    projectTitle: 'Photography Composition Rules You Need to Know',
    duration: '40s',
    createdAt: '2023-04-20T14:30:00Z',
    platform: 'TikTok',
    views: 5200,
    engagement: 'high',
    published: true
  }
];

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

export default function ClipsPage() {
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'drafts'
  const [platformFilter, setPlatformFilter] = useState('all'); // 'all', 'instagram', 'tiktok', 'youtube'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'most-views', 'engagement'
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Filter and sort clips
  const filteredClips = clipsData.filter(clip => {
    // Apply status filter
    if (filter === 'published' && !clip.published) return false;
    if (filter === 'drafts' && clip.published) return false;
    
    // Apply platform filter
    if (platformFilter !== 'all' && clip.platform.toLowerCase() !== platformFilter) return false;
    
    // Apply search query
    if (searchQuery && !clip.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  }).sort((a, b) => {
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most-views':
        return b.views - a.views;
      case 'engagement':
        // Basic engagement sort: high > medium > low
        const engagementOrder = { high: 1, medium: 2, low: 3 };
        return (engagementOrder[a.engagement as keyof typeof engagementOrder] || 3) - 
               (engagementOrder[b.engagement as keyof typeof engagementOrder] || 3);
      default:
        return 0;
    }
  });

  // Get stats for display
  const totalClips = clipsData.length;
  const publishedCount = clipsData.filter(clip => clip.published).length;
  const draftCount = totalClips - publishedCount;
  const totalViews = clipsData.reduce((sum, clip) => sum + clip.views, 0);

  const getPlatformIcon = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'instagram': return <i className="ri-instagram-line text-pink-400"></i>;
      case 'tiktok': return <i className="ri-tiktok-line text-teal-400"></i>;
      case 'youtube': return <i className="ri-youtube-line text-red-400"></i>;
      default: return <i className="ri-play-circle-line text-slate-400"></i>;
    }
  };

  const getEngagementBadge = (engagement: string) => {
    switch(engagement) {
      case 'high':
        return <span className="px-2 py-0.5 text-xs bg-green-900/30 text-green-400 rounded-full">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs bg-blue-900/30 text-blue-400 rounded-full">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 text-xs bg-yellow-900/30 text-yellow-400 rounded-full">Low</span>;
    }
  };

  // Placeholder sort options to use setSortBy
  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Most Views', value: 'most-views' },
    { label: 'Engagement', value: 'engagement' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <Header />

        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Clips Library</h1>
              <p className="text-sm text-slate-400">Manage and publish your generated clips</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/upload" className="inline-flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-button whitespace-nowrap">
                <i className="ri-upload-line mr-1.5"></i>
                Upload New Video
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-primary/20 text-primary rounded-full mr-4">
                  <i className="ri-film-line text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Clips</p>
                  <h3 className="text-2xl font-semibold text-white">{totalClips}</h3>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-green-500/20 text-green-500 rounded-full mr-4">
                  <i className="ri-checkbox-circle-line text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Published</p>
                  <h3 className="text-2xl font-semibold text-white">{publishedCount}</h3>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-yellow-500/20 text-yellow-500 rounded-full mr-4">
                  <i className="ri-draft-line text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Drafts</p>
                  <h3 className="text-2xl font-semibold text-white">{draftCount}</h3>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-500/20 text-blue-500 rounded-full mr-4">
                  <i className="ri-eye-line text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Views</p>
                  <h3 className="text-2xl font-semibold text-white">{totalViews.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 flex-wrap">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-button text-sm mb-2 ${filter === 'all' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                All Clips
              </button>
              <button 
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-button text-sm mb-2 ${filter === 'published' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                <i className="ri-checkbox-circle-line mr-1"></i> Published
              </button>
              <button 
                onClick={() => setFilter('drafts')}
                className={`px-4 py-2 rounded-button text-sm mb-2 ${filter === 'drafts' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                <i className="ri-draft-line mr-1"></i> Drafts
              </button>
              <div className="flex items-center space-x-2 mb-2 ml-auto md:ml-4">
                <span className="text-sm text-slate-400">Sort by:</span>
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1.5 rounded-button text-xs ${sortBy === option.value ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <input
                  type="text"
                  placeholder="Search clips..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-button focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder-slate-400"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <i className="ri-search-line"></i>
                </div>
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-slate-800 text-slate-300 px-4 py-2 rounded-button border border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 pr-8"
                  value={platformFilter}
                  onChange={e => setPlatformFilter(e.target.value)}
                >
                  <option value="all">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
              <div className="flex bg-slate-800 rounded-button overflow-hidden">
                <button 
                  onClick={() => setView('grid')}
                  className={`w-9 h-9 flex items-center justify-center ${view === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  <i className="ri-grid-fill"></i>
                </button>
                <button 
                  onClick={() => setView('list')}
                  className={`w-9 h-9 flex items-center justify-center ${view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  <i className="ri-list-check"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Clips Grid View */}
          {view === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClips.map(clip => (
                <div key={clip.id} className="bg-slate-900 rounded-lg overflow-hidden hover:translate-y-[-2px] transition shadow-lg">
                  <div className="relative aspect-video group">
                    <Image 
                        src={clip.thumbnail} 
                        alt={clip.title} 
                        width={360}
                        height={202}
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
                        <i className="ri-play-fill text-2xl"></i>
                      </button>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        clip.published ? 'bg-green-500/90' : 'bg-yellow-500/90'
                      }`}>
                        {clip.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    {/* Duration & Platform */}
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                      <div className="bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center">
                        <i className="ri-time-line mr-1 text-xs"></i>
                        <span>{clip.duration}</span>
                      </div>
                      <div className="bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center">
                        {getPlatformIcon(clip.platform)}
                        <span className="ml-1">{clip.platform}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-white hover:text-primary transition">{clip.title}</h3>
                        <div className="flex items-center text-xs text-slate-400 mt-1 space-x-3">
                          <span>From: {clip.projectTitle}</span>
                        </div>
                        <div className="flex items-center mt-2 justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-slate-400 flex items-center">
                              <i className="ri-eye-line mr-1"></i> {clip.views.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-400">
                              {getEngagementBadge(clip.engagement)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{formatDate(clip.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex">
                        <Link href={`/clips/${clip.projectId}?clipId=${clip.id}`} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-button mr-2">
                          <i className="ri-edit-line mr-1"></i> Edit
                        </Link>
                        <button className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-button">
                          <i className="ri-download-line mr-1"></i> Download
                        </button>
                      </div>
                      <div className="relative">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300">
                          <i className="ri-more-2-fill"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clips List View */}
          {view === 'list' && (
            <div className="bg-slate-900 rounded-lg overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Clip</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {filteredClips.map(clip => (
                      <tr key={clip.id} className="hover:bg-slate-800">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-16 rounded overflow-hidden relative group">
                              <Image 
                                src={clip.thumbnail} 
                                alt={clip.title} 
                                width={64}
                                height={40}
                                className="h-10 w-16 object-cover" 
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <i className="ri-play-fill text-white"></i>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{clip.title}</div>
                              <div className="text-xs text-slate-400">{formatDate(clip.createdAt)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {clip.projectTitle}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <div className="flex items-center">
                            {getPlatformIcon(clip.platform)}
                            <span className="ml-2">{clip.platform}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {clip.duration}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-sm text-slate-300 mr-2">{clip.views.toLocaleString()}</span>
                            {getEngagementBadge(clip.engagement)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            clip.published ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {clip.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/clips/${clip.projectId}?clipId=${clip.id}`} className="text-slate-400 hover:text-white">
                              <i className="ri-edit-line"></i>
                            </Link>
                            <button className="text-slate-400 hover:text-white">
                              <i className="ri-download-line"></i>
                            </button>
                            <button className="text-slate-400 hover:text-white">
                              <i className="ri-more-2-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredClips.length === 0 && (
            <div className="bg-slate-900 rounded-lg py-16 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <i className="ri-film-line text-3xl text-slate-500"></i>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No clips found</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                  {searchQuery || platformFilter !== 'all' || filter !== 'all' 
                    ? `No clips matching your current filters` 
                    : "You haven't generated any clips yet. Upload a video to get started."}
                </p>
                <Link href="/upload" className="inline-flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-button whitespace-nowrap">
                  <i className="ri-upload-line mr-1.5"></i>
                  Upload New Video
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 