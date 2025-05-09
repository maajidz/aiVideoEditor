"use client"; // Make this a Client Component

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import hook to get current path
import { useLayoutContext } from '@/app/context/LayoutContext'; // Import context hook

// Define the structure for sidebar links
const sidebarLinks = [
  { href: "/", icon: "ri-dashboard-line", label: "Dashboard" },
  { href: "/my-dashboard", icon: "ri-dashboard-2-line", label: "My Dashboard" },
  { href: "/upload", icon: "ri-upload-cloud-line", label: "Upload Video" },
  { href: "/ideas", icon: "ri-lightbulb-line", label: "Idea Generator" },
  { href: "/content", icon: "ri-folder-line", label: "Content Manager" },
  { href: "/analytics", icon: "ri-bar-chart-line", label: "Analytics" },
  { href: "/settings", icon: "ri-settings-3-line", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname(); // Get the current path
  const { isSidebarCollapsed, toggleSidebar } = useLayoutContext(); // Use context

  return (
    <aside className={`
      ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
      bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 
      transition-all duration-300 ease-in-out relative
    `}>
      {/* Logo */}
      <div className="p-5 flex items-center justify-center border-b border-slate-800 h-[69px]"> {/* Fixed height */} 
        <Link href="/" className={`text-2xl font-pacifico text-white ${isSidebarCollapsed ? 'hidden' : 'block'}`}>logo</Link>
        <Link href="/" className={`text-2xl text-white ${isSidebarCollapsed ? 'block' : 'hidden'}`}><i className="ri-vidicon-line"></i></Link> {/* Icon when collapsed */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  title={link.label} // Add title for tooltip when collapsed
                  className={`
                    sidebar-link flex items-center px-4 py-3 text-sm font-medium rounded-md 
                    transition-colors duration-150
                    ${isSidebarCollapsed ? 'justify-center' : ''} 
                    ${isActive
                      ? 'active text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <div className={`w-5 h-5 flex items-center justify-center ${isSidebarCollapsed ? '' : 'mr-3'}`}>
                    <i className={link.icon}></i>
                  </div>
                  <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pro Plan Section (Hidden when collapsed) */}
      <div className={`p-4 border-t border-slate-800 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
        <div className="bg-slate-800/50 p-3 rounded">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/20 text-primary rounded-full mr-2 shrink-0">
              <i className="ri-rocket-line"></i>
            </div>
            <span className="text-sm font-medium">Pro Plan</span>
            <span className="ml-auto text-xs bg-primary/20 text-primary py-1 px-2 rounded-full">Active</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Storage</span>
              <span>75% used</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>
          <button className="w-full py-1.5 text-xs font-medium text-white bg-slate-700 hover:bg-slate-600 transition-colors rounded-button">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar} 
        className="absolute -right-3 top-16 p-1.5 bg-slate-700 hover:bg-primary text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 z-20"
        title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <i className={`w-4 h-4 block ${isSidebarCollapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'}`}></i>
      </button>
    </aside>
  );
} 