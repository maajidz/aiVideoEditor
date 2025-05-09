'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserProfileMenuProps {
  userName: string;
  userImage?: string;
}

export default function UserProfileMenu({ userName, userImage }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleSignOut = () => {
    // This would be replaced with actual sign-out logic
    console.log('Signing out');
    router.push('/auth/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center space-x-2 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
          {userImage ? (
            <Image 
              src={userImage} 
              alt={userName} 
              width={32} 
              height={32} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-sm font-medium hidden sm:block">{userName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-md shadow-lg overflow-hidden z-10">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm text-white font-medium">{userName}</p>
            <p className="text-xs text-slate-400 mt-1">user@example.com</p>
          </div>
          <div className="py-1">
            <Link 
              href="/settings/profile" 
              className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-4 h-4 flex items-center justify-center mr-3">
                <i className="ri-user-line"></i>
              </div>
              Profile Settings
            </Link>
            <Link 
              href="/settings/account" 
              className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-4 h-4 flex items-center justify-center mr-3">
                <i className="ri-settings-4-line"></i>
              </div>
              Account Settings
            </Link>
            <Link 
              href="/settings/subscriptions" 
              className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-4 h-4 flex items-center justify-center mr-3">
                <i className="ri-vip-crown-line"></i>
              </div>
              Subscription
            </Link>
          </div>
          <div className="py-1 border-t border-slate-700">
            <button 
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white w-full text-left"
            >
              <div className="w-4 h-4 flex items-center justify-center mr-3">
                <i className="ri-logout-box-line"></i>
              </div>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 