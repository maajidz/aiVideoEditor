"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
// import Sidebar from '@/components/Sidebar'; // Removed redundant import
import Link from 'next/link';
import Image from 'next/image'; // Added Image import
import { useLayoutContext /* Removed BackgroundUploadItem as it's not directly used for annotation here */ } from '@/app/context/LayoutContext'; // Import context
import ProjectCard from '@/components/ProjectCard'; // Import ProjectCard
import { UploadStatus } from '@/types/types'; // Import UploadStatus for type consistency
import { statusColors, statusDescriptions } from '@/components/ProjectCard'; // Assuming they can be exported

// Mock project data for the projects library
const projectsData = [
  {
    id: '123456',
    title: 'Ultimate Guide to Camera Settings',
    thumbnail: 'https://readdy.ai/api/search-image?query=camera%20settings%20guide%20filming%20high%20quality%20tutorial%20professional%20equipment&width=360&height=202&seq=550&orientation=landscape',
    uploadDate: '2023-04-28T14:30:00Z',
    duration: '32:45',
    status: 'completed', // 'uploading', 'processing', 'completed', 'failed'
    clipCount: 8,
    category: 'tutorial',
  },
  {
    id: '123457',
    title: 'Top 10 Lightroom Presets for Landscape Photography',
    thumbnail: 'https://readdy.ai/api/search-image?query=landscape%20photography%20beautiful%20nature%20editing%20process%20mountains%20sunset&width=360&height=202&seq=551&orientation=landscape',
    uploadDate: '2023-04-25T10:15:00Z',
    duration: '18:22',
    status: 'completed',
    clipCount: 5,
    category: 'tutorial',
  },
  {
    id: '123458',
    title: 'Interview with Photography Expert Sarah Johnson',
    thumbnail: 'https://readdy.ai/api/search-image?query=photography%20interview%20professional%20photographer%20studio%20equipment%20talking%20about%20techniques&width=360&height=202&seq=552&orientation=landscape',
    uploadDate: '2023-04-22T09:45:00Z',
    duration: '45:12',
    status: 'processing',
    clipCount: 0,
    category: 'interview',
  },
  {
    id: '123459',
    title: 'Behind the Scenes: Product Photoshoot',
    thumbnail: 'https://readdy.ai/api/search-image?query=product%20photography%20behind%20the%20scenes%20studio%20setup%20lighting%20professional%20equipment&width=360&height=202&seq=553&orientation=landscape',
    uploadDate: '2023-04-20T16:20:00Z',
    duration: '27:35',
    status: 'completed',
    clipCount: 6,
    category: 'behind-the-scenes',
  },
  {
    id: '123460',
    title: 'Photography Composition Rules You Need to Know',
    thumbnail: 'https://readdy.ai/api/search-image?query=photography%20composition%20rules%20demonstrated%20with%20examples%20professional%20camera&width=360&height=202&seq=554&orientation=landscape',
    uploadDate: '2023-04-18T11:30:00Z',
    duration: '22:18',
    status: 'completed',
    clipCount: 4,
    category: 'tutorial',
  },
  {
    id: '123461',
    title: 'Street Photography Tips and Tricks',
    thumbnail: 'https://readdy.ai/api/search-image?query=street%20photography%20urban%20environment%20candid%20shots%20city%20life&width=360&height=202&seq=555&orientation=landscape',
    uploadDate: '2023-04-15T13:45:00Z',
    duration: '19:56',
    status: 'completed',
    clipCount: 3,
    category: 'tutorial',
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

// Define an interface for items displayed in the list view
interface DisplayListItem {
  id: string;
  title: string;
  thumbnail: string;
  uploadDate: string;
  duration: string;
  status: string | UploadStatus; // Can be from projectsData or backgroundItems
  clipCount: number;
  category?: string; // category might not exist on backgroundItems initially
  _isProcessingItem?: boolean;
  _progress?: number;
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'processing'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'a-z', 'z-a'
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { isProcessingInBackground, backgroundItems } = useLayoutContext(); // Get context state

  // Filter and sort projects
  const projectsToDisplay: DisplayListItem[] = projectsData
    .filter(project => {
      // Exclude items that are currently being processed in the background for grid view,
      // as they are shown in a separate section. For list view, they'll be merged.
      if (view === 'grid' && isProcessingInBackground && backgroundItems.some(bgItem => bgItem.id === project.id)) {
        return false;
      }
      // Apply status filter
      if (filter !== 'all' && project.status !== filter) return false;
      // Apply search query
      if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // Apply sorting (same logic as before)
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'oldest':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const listDisplayItems: DisplayListItem[] = view === 'list' && isProcessingInBackground && backgroundItems.length > 0 
    ? [
        ...backgroundItems.map(item => ({
          id: item.id,
          title: item.name,
          thumbnail: projectsData.find(p=>p.id === item.id)?.thumbnail || 'https://readdy.ai/api/search-image?query=abstract%20tech%20background&width=160&height=90&seq=99&orientation=landscape',
          uploadDate: new Date().toISOString(), // Placeholder, as bgItem doesn't have this
          duration: projectsData.find(p=>p.id === item.id)?.duration || 'N/A',
          status: item.status as UploadStatus, // Cast to UploadStatus
          _isProcessingItem: true, 
          _progress: item.progress, 
          clipCount: projectsData.find(p=>p.id === item.id)?.clipCount || 0,
          category: projectsData.find(p=>p.id === item.id)?.category || 'N/A',
        })),
        ...projectsToDisplay.filter(p => !backgroundItems.some(bg => bg.id === p.id))
      ]
    : projectsToDisplay;

  return (
    // <div className="flex h-screen overflow-hidden"> // Removed redundant outer div
    //   <Sidebar /> // Removed redundant Sidebar
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <Header />

        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Projects Library</h1>
              <p className="text-sm text-slate-400">Manage your video projects</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/upload" className="inline-flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-button whitespace-nowrap">
                <i className="ri-add-line mr-1.5"></i>
                New Project
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-button text-sm ${filter === 'all' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                All Projects
              </button>
              <button 
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-button text-sm ${filter === 'completed' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Completed
              </button>
              <button 
                onClick={() => setFilter('processing')}
                className={`px-4 py-2 rounded-button text-sm ${filter === 'processing' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Processing
              </button>
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <input
                  type="text"
                  placeholder="Search projects..."
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
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="a-z">A-Z</option>
                  <option value="z-a">Z-A</option>
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

          {/* Display actively processing items from context - ONLY FOR GRID VIEW */}
          {view === 'grid' && isProcessingInBackground && backgroundItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Currently Processing</h2>
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${view === 'grid' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
                {backgroundItems.map(item => {
                  // Attempt to find matching full project data for more details if needed
                  const fullProjectData = projectsData.find(p => p.id === item.id);
                  return (
                    <ProjectCard 
                      key={item.id} 
                      project={{
                        id: item.id,
                        title: item.name,
                        status: item.status, // Should be UploadStatus
                        progress: item.progress,
                        thumbnailUrl: fullProjectData?.thumbnail || 'https://readdy.ai/api/search-image?query=abstract%20tech%20background&width=360&height=202&seq=99&orientation=landscape', // Placeholder if not found
                        originalLength: fullProjectData?.duration || 'N/A',
                        clipsGenerated: fullProjectData?.clipCount || 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects Grid View */}
          {view === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsToDisplay.map(project => (
                <div key={project.id} className="bg-slate-900 rounded-lg overflow-hidden hover:translate-y-[-2px] transition shadow-lg">
                  <Link href={`/review?projectId=${project.id}`} className="block">
                    <div className="relative aspect-video">
                      <Image 
                        src={project.thumbnail} 
                        alt={project.title} 
                        width={360} // Example width
                        height={202} // Example height (for 16:9)
                        className="w-full h-full object-cover" 
                      />
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'completed' ? 'bg-green-500/90' : 
                          project.status === 'processing' ? 'bg-blue-500/90' : 
                          project.status === 'uploading' ? 'bg-yellow-500/90' :
                          'bg-red-500/90'
                        }`}>
                          {project.status === 'completed' ? 'Completed' : 
                           project.status === 'processing' ? 'Processing' : 
                           project.status === 'uploading' ? 'Uploading' : 
                           'Failed'}
                        </span>
                      </div>
                      {/* Duration */}
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {project.duration}
                      </div>
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/review?projectId=${project.id}`} className="block">
                          <h3 className="font-medium text-white hover:text-primary transition">{project.title}</h3>
                        </Link>
                        <div className="flex items-center text-xs text-slate-400 mt-1 space-x-3">
                          <span>{formatDate(project.uploadDate)}</span>
                          {project.clipCount > 0 && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-600 inline-block"></span>
                              <span>{project.clipCount} clips</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300">
                          <i className="ri-more-2-fill"></i>
                        </button>
                        {/* Dropdown menu would go here in a real implementation */}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex">
                        <Link href={`/review?projectId=${project.id}`} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-button mr-2">
                          <i className="ri-eye-line mr-1"></i> View
                        </Link>
                        {project.status === 'completed' && (
                          <Link href={`/clips/${project.id}`} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-button">
                            <i className="ri-scissors-cut-line mr-1"></i> Edit Clips
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects List View */}
          {view === 'list' && (
            <div className="bg-slate-900 rounded-lg overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Project</th>
                      {/* Conditionally show Progress for list view if processing items are displayed there too */}
                      {/* We might want a dedicated column or integrate progress into the status */}
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Progress</th> {/* New Progress Column */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Clips</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {/* Option: Prepend backgroundItems to filteredProjects for list view if not handled separately */}
                    {/* For now, backgroundItems are shown in their own grid above the main list/grid */}
                    {listDisplayItems.map((project: DisplayListItem) => ( // Use DisplayListItem type
                      <tr key={project.id} className="hover:bg-slate-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-16 rounded overflow-hidden relative"> {/* Added relative for Image */}
                              <Image 
                                src={project.thumbnail} 
                                alt={project.title} 
                                width={64} // w-16
                                height={36} // for aspect-video on h-10 approx.
                                className="h-10 w-16 object-cover" 
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{project.title}</div>
                              <div className="text-xs text-slate-400">{project.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300"> {/* Progress Cell */}
                          {project._isProcessingItem ? (
                            <div className="w-24">
                              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${statusColors[project.status as UploadStatus] || 'bg-primary'} rounded-full transition-all duration-500 ease-out`}
                                  style={{ width: `${project._progress}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] text-slate-400 block text-center mt-0.5">{project._progress?.toFixed(0)}%</span>
                            </div>
                          ) : (
                            <span>N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {project.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {formatDate(project.uploadDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ // Needs to handle UploadStatus from backgroundItems too
                            project._isProcessingItem ? (statusColors[project.status as UploadStatus] + '/30 text-' + statusColors[project.status as UploadStatus]?.replace('bg-','').replace('-500','-400')) :
                            project.status === 'completed' ? 'bg-green-900/30 text-green-400' : 
                            project.status === 'processing' ? 'bg-blue-900/30 text-blue-400' : 
                            project.status === 'uploading' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-red-900/30 text-red-400'
                          }`}>
                            {project._isProcessingItem ? statusDescriptions[project.status as UploadStatus] : 
                             project.status === 'completed' ? 'Completed' : 
                             project.status === 'processing' ? 'Processing' : 
                             project.status === 'uploading' ? 'Uploading' : 
                             'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {project.clipCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/review?projectId=${project.id}`} className="text-slate-400 hover:text-white">
                              <i className="ri-eye-line"></i>
                            </Link>
                            {project.status === 'completed' && (
                              <Link href={`/clips/${project.id}`} className="text-slate-400 hover:text-white">
                                <i className="ri-scissors-cut-line"></i>
                              </Link>
                            )}
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
          {projectsToDisplay.length === 0 && (
            <div className="bg-slate-900 rounded-lg py-16 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <i className="ri-inbox-line text-3xl text-slate-500"></i>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                  {searchQuery ? `No projects matching "${searchQuery}"` : "You haven't uploaded any videos yet. Get started by creating a new project."}
                </p>
                <Link href="/upload" className="inline-flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-button whitespace-nowrap">
                  <i className="ri-add-line mr-1.5"></i>
                  New Project
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    // </div>
  );
} 