import React from 'react';
import UserProfileMenu from './UserProfileMenu';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
  // TODO: Replace placeholder data and images later
  // TODO: Implement search functionality
  // TODO: Implement notification functionality
  // TODO: Make user profile dynamic

  // Get current date dynamically (example)
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="text-sm text-slate-400">{currentDate}</p> {/* Use dynamic date */}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-slate-800 text-sm text-slate-300 pl-9 pr-4 py-2 rounded-md border-none w-64 focus:ring-2 focus:ring-primary/50"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 flex items-center justify-center pointer-events-none">
              <i className="ri-search-line"></i>
            </div>
          </div>
          <div className="relative">
            <button className="relative p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
              <i className="ri-notification-3-line"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
          <UserProfileMenu userName="James Wilson" />
        </div>
      </div>
    </header>
  );
} 