import React from 'react';

// Placeholder data for stats
const stats = [
  {
    title: "Total Views",
    value: "24.5K",
    change: "+12.3%",
    icon: "ri-eye-line",
    changeType: "increase" as const,
  },
  {
    title: "Engagement Rate",
    value: "8.7%",
    change: "+3.2%",
    icon: "ri-heart-line",
    changeType: "increase" as const,
  },
  {
    title: "Clips Generated",
    value: "32",
    change: "+8.5%",
    icon: "ri-video-line",
    changeType: "increase" as const,
  },
  // Example of decrease:
  // {
  //   title: "Bounce Rate",
  //   value: "45%",
  //   change: "-2.1%",
  //   icon: "ri-arrow-down-line",
  //   changeType: "decrease" as const,
  // },
];

export default function AnalyticsOverview() {
  // TODO: Fetch actual analytics data
  // TODO: Implement time range selection logic
  // TODO: Integrate actual charting library (e.g., ECharts, Recharts)

  return (
    <div className="bg-slate-900 rounded p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <h3 className="font-medium text-white">Analytics Overview</h3>
        <div className="flex items-center space-x-2">
          {/* Time range selector - basic styling */}
          <div className="flex items-center space-x-1 px-1 py-1 bg-slate-800 rounded-full text-xs">
            <button className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              7 Days
            </button>
            <button className="px-2 py-0.5 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-slate-200">
              30 Days
            </button>
            <button className="px-2 py-0.5 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-slate-200">
              All Time
            </button>
          </div>
          <button title="Download Report" className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700">
            <span className="sr-only">Download Report</span>
            <i className="ri-download-line w-4 h-4"></i>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-800 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-slate-400">{stat.title}</h4>
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <i className={stat.icon}></i>
              </div>
            </div>
            <div className="flex items-end">
              <h3 className="text-2xl font-semibold text-white">{stat.value}</h3>
              <span
                className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded flex items-center ${stat.changeType === 'increase' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}
              >
                <i className={`mr-0.5 ${stat.changeType === 'increase' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`}></i>
                {stat.change.replace('+', '').replace('-', '')} {/* Show absolute change */}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">vs previous period</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div id="viewsChart" className="w-full h-64 bg-slate-800 rounded flex items-center justify-center">
        <p className="text-slate-500">Analytics Chart Placeholder</p>
      </div>
    </div>
  );
} 