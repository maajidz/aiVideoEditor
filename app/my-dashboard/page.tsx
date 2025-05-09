import AnalyticsOverview from "@/components/AnalyticsOverview";
import GeneratedClips from "@/components/GeneratedClips";
import Header from "@/components/Header";
import RecentProjects from "@/components/RecentProjects";
// Sidebar import should be removed

export default function MyDashboardPage() {
  return (
    // Outer div and Sidebar element removed
    <main className="flex-1 overflow-y-auto bg-slate-950">
      <Header title="My Dashboard" />

      {/* Dashboard Content Area */}
      <div className="p-6">
        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Welcome back, James!</h2> {/* Dynamic name */}
            <p className="text-sm text-slate-400">Here&apos;s what&apos;s happening with your content today.</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-button whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-add-line"></i>
              </div>
              New Project
            </button>
            <button className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-button whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-upload-cloud-line"></i>
              </div>
              Upload Video
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Recent Projects Section */}
          <div className="col-span-12 lg:col-span-8">
            <RecentProjects />
          </div>

          {/* Generated Clips Section */}
          <div className="col-span-12 lg:col-span-4">
            <GeneratedClips />
          </div>

          {/* Analytics Overview Section */}
          <div className="col-span-12">
            <AnalyticsOverview />
          </div>
        </div>
      </div>
    </main>
  );
} 