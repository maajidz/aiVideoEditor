import Link from 'next/link';
import Image from 'next/image';

export default function EmptyDashboard() {
  return (
    <div className="p-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Welcome to Video Farming!</h2>
          <p className="text-sm text-slate-400">Let&apos;s start creating and managing your video content.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-button whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-add-line"></i>
            </div>
            New Project
          </button>
          <Link href="/upload">
            <button className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-button whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-upload-cloud-line"></i>
              </div>
              Upload Video
            </button>
          </Link>
        </div>
      </div>

      {/* Empty State Content */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-2xl mx-auto">
        <div className="w-40 h-40 flex items-center justify-center rounded-full bg-slate-800 mb-6">
          <i className="ri-video-add-line text-6xl text-primary"></i>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-3">Start Your Content Journey</h2>
        <p className="text-slate-400 mb-8 max-w-lg">Upload your first video and let our AI help you transform it into engaging content for multiple platforms. We&apos;ll handle the editing while you focus on creating.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
              <i className="ri-upload-cloud-line text-xl"></i>
            </div>
            <h3 className="text-white font-medium mb-2">Upload Video</h3>
            <p className="text-sm text-slate-400">Upload your long-form video content</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
              <i className="ri-scissors-cut-line text-xl"></i>
            </div>
            <h3 className="text-white font-medium mb-2">AI Processing</h3>
            <p className="text-sm text-slate-400">Our AI will analyze and clip your content</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
              <i className="ri-share-forward-line text-xl"></i>
            </div>
            <h3 className="text-white font-medium mb-2">Share</h3>
            <p className="text-sm text-slate-400">Publish clips across platforms</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/upload">
            <button className="flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-button whitespace-nowrap w-full sm:w-auto">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-upload-cloud-line"></i>
              </div>
              Upload Your First Video
            </button>
          </Link>
          <button className="flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-button whitespace-nowrap w-full sm:w-auto">
            <div className="w-5 h-5 flex items-center justify-center mr-2">
              <i className="ri-play-circle-line"></i>
            </div>
            Watch Tutorial
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                <i className="ri-lightbulb-line text-xl"></i>
              </div>
              <h3 className="text-white font-medium">Pro Tips</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-4 h-4 flex items-center justify-center mt-1 mr-3 text-primary">
                  <i className="ri-checkbox-circle-line"></i>
                </div>
                <p className="text-sm text-slate-400">Record in landscape mode for better cross-platform compatibility</p>
              </li>
              <li className="flex items-start">
                <div className="w-4 h-4 flex items-center justify-center mt-1 mr-3 text-primary">
                  <i className="ri-checkbox-circle-line"></i>
                </div>
                <p className="text-sm text-slate-400">Ensure good lighting and clear audio for best results</p>
              </li>
              <li className="flex items-start">
                <div className="w-4 h-4 flex items-center justify-center mt-1 mr-3 text-primary">
                  <i className="ri-checkbox-circle-line"></i>
                </div>
                <p className="text-sm text-slate-400">Keep your main points clear and concise</p>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                <i className="ri-rocket-line text-xl"></i>
              </div>
              <h3 className="text-white font-medium">Getting Started</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-4 h-4 flex items-center justify-center mt-1 mr-3 text-primary">
                  <i className="ri-arrow-right-circle-line"></i>
                </div>
                <p className="text-sm text-slate-400">Complete your profile settings</p>
              </li>
              <li className="flex items-start">
                <div className="w-4 h-4 flex items-center justify-center mt-1 mr-3 text-primary">
                  <i className="ri-arrow-right-circle-line"></i>
                </div>
                <p className="text-sm text-slate-400">Connect your social media accounts</p>
              </li>
              <li className="flex items-start">
                <div className="w-4 h-4 flex items-center justify-center mt-1 mr-3 text-primary">
                  <i className="ri-arrow-right-circle-line"></i>
                </div>
                <p className="text-sm text-slate-400">Review our content guidelines</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Recent Projects */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-medium text-white">Recent Projects</h3>
        <div className="flex items-center">
          <button className="text-sm text-slate-400 hover:text-white flex items-center">
            <span>View All</span>
            <div className="w-4 h-4 flex items-center justify-center ml-1">
              <i className="ri-arrow-right-s-line"></i>
            </div>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project 1 */}
        <div className="bg-slate-800 rounded p-4">
          <div className="relative mb-3 rounded overflow-hidden aspect-video">
            <Image 
              src="https://readdy.ai/api/search-image?query=professional%20camera%20setup%20for%20content%20creation%2C%20video%20equipment%2C%20high%20quality%20studio%20lighting%2C%20modern%20video%20production%20setup%2C%20detailed%20equipment&width=400&height=225&seq=456&orientation=landscape" 
              alt="Project Thumbnail 1" 
              width={400} 
              height={225} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
              <span className="text-xs font-medium px-2 py-1 bg-primary/90 rounded-full">In Progress</span>
            </div>
          </div>
          <h4 className="font-medium text-white mb-1">Ultimate Guide to Camera Settings</h4>
          <p className="text-xs text-slate-400 mb-3">Original Length: 32:45 • 8 clips generated</p>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Processing</span>
              <span className="text-slate-300">75%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">
                <i className="ri-youtube-fill text-red-500"></i>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">
                <i className="ri-instagram-fill text-pink-500"></i>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">
                <i className="ri-tiktok-fill text-slate-300"></i>
              </div>
            </div>
            <button className="text-xs text-slate-300 hover:text-white flex items-center">
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                <i className="ri-more-2-fill"></i>
              </div>
            </button>
          </div>
        </div>
        
        {/* Project 2 */}
        <div className="bg-slate-800 rounded p-4">
          <div className="relative mb-3 rounded overflow-hidden aspect-video">
            <Image 
              src="https://readdy.ai/api/search-image?query=travel%20vlog%20setup%2C%20scenic%20mountain%20landscape%2C%20travel%20content%20creation%2C%20backpack%20and%20camera%20gear%2C%20adventure%20filmmaking&width=400&height=225&seq=789&orientation=landscape" 
              alt="Project Thumbnail 2" 
              width={400} 
              height={225} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
              <span className="text-xs font-medium px-2 py-1 bg-green-500/90 rounded-full">Completed</span>
            </div>
          </div>
          <h4 className="font-medium text-white mb-1">Travel Vlog: Swiss Alps Adventure</h4>
          <p className="text-xs text-slate-400 mb-3">Original Length: 18:22 • 12 clips generated</p>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Processing</span>
              <span className="text-slate-300">100%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">
                <i className="ri-youtube-fill text-red-500"></i>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">
                <i className="ri-instagram-fill text-pink-500"></i>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">
                <i className="ri-facebook-fill text-blue-500"></i>
              </div>
            </div>
            <button className="text-xs text-slate-300 hover:text-white flex items-center">
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                <i className="ri-more-2-fill"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 